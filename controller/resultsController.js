import pigenOwner from "../models/pigeonOwnerModel.js";
import TournamentResult from "../models/resultModel.js"; // Adjust the path as necessary
import Tournament from "../models/tournamentModel.js";
import moment from "moment";
// For time calculations

export const owner = async (req, res) => {
  const { tournamentId } = req.params;

  try {
    // Find the tournament by its ID
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res?.status(404).json({ message: "Tournament not found" });
    }

    // Extract the participatingLofts array (assumed to contain owner IDs)
    const { participatingLofts } = tournament;

    // Fetch owners whose IDs are in the participatingLofts array
    const owners = await pigenOwner.find({ _id: { $in: participatingLofts } });

    res?.status(200).json(owners);
  } catch (error) {
    console.error("Error fetching owners:", error);
    res
      ?.status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const createTournamentResult = async (req, res) => {
  try {
    const { tournamentId, pigeonOwnerId, startTime, date, timeList } = req.body;

    // Validate the data
    if (!tournamentId || !pigeonOwnerId || !startTime || !date || !timeList) {
      return res?.status(400).json({ message: "All fields are required" });
    }

    // Get tournament details to know number of pigeons and helpers
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res?.status(400).json({ message: "Tournament not found" });
    }

    const { numberOfPigeons, helperPigeons } = tournament;

    // Format time helper function
    const formatTime = (time) => {
      if (!time || time.trim() === "") return null;  // Return null for empty times
      return time.length === 5 ? `${time}:00` : time;
    };

    // Process timeList maintaining exact positions
    const processedTimeList = timeList.map(time => {
      if (!time || time.trim() === "") {
        return null;  // Keep empty slots as null
      }
      return formatTime(time);
    });

    // Format startTime
    const formattedStartTime = formatTime(startTime) || "00:00:00";

    // Check if a result already exists
    let existingResult = await TournamentResult.findOne({
      tournamentId,
      pigeonOwnerId,
      date,
    });

    let savedResult;

    if (existingResult) {
      existingResult.startTime = formattedStartTime;
      existingResult.timeList = processedTimeList;
      savedResult = await existingResult.save();
    } else {
      const newResult = new TournamentResult({
        tournamentId,
        pigeonOwnerId,
        startTime: formattedStartTime,
        date,
        timeList: processedTimeList,
      });
      savedResult = await newResult.save();
    }

    // Process the result to calculate times based on helper pigeons
    const processedResult = await processResultWithHelpers(savedResult, tournament);

    return res?.status(existingResult ? 200 : 201).json({
      message: `Tournament result ${existingResult ? "updated" : "created"} successfully`,
      result: processedResult,
    });
  } catch (error) {
    console.error("Error handling tournament result:", error);
    res?.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Modify processResultWithHelpers to handle null values
const processResultWithHelpers = async (result, tournament) => {
  const { timeList, startTime } = result;
  const { numberOfPigeons, helperPigeons } = tournament;

  // Convert time string to seconds since start time
  const timeToSeconds = (time) => {
    if (!time) return null;  // Return null for empty/null times

    const startMoment = moment(startTime, "HH:mm:ss");
    const currentMoment = moment(time, "HH:mm:ss");

    if (currentMoment.isBefore(startMoment)) {
      currentMoment.add(1, "day");
    }

    return currentMoment.diff(startMoment, "seconds");
  };

  // Split and process times
  const regularTimes = timeList.slice(0, numberOfPigeons);
  const helperTimes = timeList.slice(numberOfPigeons, numberOfPigeons + helperPigeons);

  // Convert all times to seconds, maintaining null values
  const regularTimesInSeconds = regularTimes.map((time, index) => ({
    time: timeToSeconds(time),
    index,
  }));

  const helperTimesInSeconds = helperTimes.map((time, index) => ({
    time: timeToSeconds(time),
    index,
  }));

  // Calculate total time based on rules
  let totalTimeInSeconds = 0;
  const excludedIndices = new Set();

  // Add helper times to excluded indices
  helperTimesInSeconds.forEach((helper) => {
    if (helper.time !== null) {
      excludedIndices.add(helper.index);
    }
  });

  // Calculate total time including valid regular times and helper times
  const validRegularTimes = regularTimesInSeconds
    .filter(item => !excludedIndices.has(item.index) && item.time !== null)
    .map(item => item.time);

  const helperTotalTimes = helperTimesInSeconds
    .filter(item => item.time !== null)
    .map(item => item.time);

  totalTimeInSeconds = [...validRegularTimes, ...helperTotalTimes].reduce(
    (sum, time) => sum + time,
    0
  );

  return {
    ...result.toObject(),
    excludedIndices: Array.from(excludedIndices),
    TotalTime: totalTimeInSeconds,
    formattedTotalTime: formatDuration(totalTimeInSeconds),
  };
};

// Update getTournamentResults to use the new processing
export const getTournamentResults = async (req, res) => {
  const { tournamentId, date } = req.params;

  try {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res?.status(404).json({ message: "Tournament not found" });
    }

    const results = await TournamentResult.find({
      tournamentId,
      date,
    });

    if (results.length === 0) {
      return res?.status(404).json({
        message:
          "No tournament results found for the specified tournament and date",
      });
    }

    // Process each result with helper pigeons
    const processedResults = await Promise.all(
      results.map((result) => processResultWithHelpers(result, tournament))
    );

    res?.status(200).json(processedResults);
  } catch (error) {
    console.error("Error fetching tournament results:", error);
    res
      ?.status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getTournamentResultById = async (req, res) => {
  try {
    const result = await TournamentResult.findById(req.params.id);
    if (!result) {
      return res?.status(404).json({ message: "Tournament result not found" });
    }
    res?.status(200).json(result);
  } catch (error) {
    console.error("Error fetching tournament result by ID:", error);
    res
      ?.status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getTournamentOwnerResults = async (req, res) => {
  const { tournamentId } = req.params;

  try {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res?.status(404).json({ message: "Tournament not found" });
    }

    const { numberOfPigeons, helperPigeons } = tournament;

    // Find all results for the tournament, for all owners
    const results = await TournamentResult.find({
      tournamentId: tournamentId,
    }).sort({ date: 1 });

    if (results.length === 0) {
      return res?.status(404).json({
        message: "No results found for this tournament",
      });
    }

    // Group results by owner
    const ownerResults = {};

    // Process each day's results
    results.forEach((result) => {
      const { pigeonOwnerId, startTime, timeList, date } = result;

      // Initialize owner's data if not exists
      if (!ownerResults[pigeonOwnerId]) {
        ownerResults[pigeonOwnerId] = {
          pigeonTotals: {},
          grandTotal: 0,
        };
      }

      const startMoment = moment(startTime, "HH:mm:ss");

      // Split times into regular and helper pigeons
      const regularTimes = timeList.slice(0, numberOfPigeons);
      const helperTimes = timeList.slice(
        numberOfPigeons,
        numberOfPigeons + helperPigeons
      );

      // Process regular times
      regularTimes.forEach((time, index) => {
        const currentMoment = moment(time, "HH:mm:ss");
        const isExcluded = !!helperTimes[index]; // Check if there's a helper time

        if (currentMoment.isBefore(startMoment)) {
          currentMoment.add(1, "day");
        }

        const duration = currentMoment.diff(startMoment, "seconds");

        // Initialize pigeon's data if not exists
        if (!ownerResults[pigeonOwnerId].pigeonTotals[index + 1]) {
          ownerResults[pigeonOwnerId].pigeonTotals[index + 1] = {
            totalTime: duration,
            dailyTimes: [],
            excluded: isExcluded,
          };
        } else {
          ownerResults[pigeonOwnerId].pigeonTotals[index + 1].totalTime +=
            duration;
        }

        // Always store the actual time in dailyTimes
        ownerResults[pigeonOwnerId].pigeonTotals[index + 1].dailyTimes.push({
          date,
          duration,
          formattedDuration: formatDuration(duration),
          excluded: isExcluded,
        });
        ownerResults[pigeonOwnerId].pigeonTotals[index + 1].excluded =
          isExcluded;
      });

      // Process helper times
      helperTimes.forEach((time, index) => {
        if (time) {
          const currentMoment = moment(time, "HH:mm:ss");
          if (currentMoment.isBefore(startMoment)) {
            currentMoment.add(1, "day");
          }

          const duration = currentMoment.diff(startMoment, "seconds");
          const helperIndex = numberOfPigeons + index + 1;

          if (!ownerResults[pigeonOwnerId].pigeonTotals[helperIndex]) {
            ownerResults[pigeonOwnerId].pigeonTotals[helperIndex] = {
              totalTime: duration,
              dailyTimes: [],
              isHelper: true,
            };
          } else {
            ownerResults[pigeonOwnerId].pigeonTotals[helperIndex].totalTime +=
              duration;
          }

          ownerResults[pigeonOwnerId].pigeonTotals[helperIndex].dailyTimes.push(
            {
              date,
              duration,
              formattedDuration: formatDuration(duration),
            }
          );
        }
      });
    });

    // Process final results for each owner
    const finalResults = await Promise.all(
      Object.entries(ownerResults).map(async ([ownerId, data]) => {
        const owner = await pigenOwner.findById(ownerId);
        let grandTotal = 0;

        const pigeonResults = Object.entries(data.pigeonTotals).map(
          ([pigeonNumber, pigeonData]) => {
            // Calculate actual total time for the pigeon
            const actualTotalTime = pigeonData.dailyTimes.reduce(
              (sum, time) => sum + time.duration,
              0
            );

            // Only add to grand total if the pigeon is NOT excluded
            if (!pigeonData.excluded) {
              grandTotal += actualTotalTime;
            }

            return {
              pigeonNumber: `Pigeon ${pigeonNumber}`,
              totalTime: actualTotalTime,
              formattedTotalTime: formatDuration(actualTotalTime),
              dailyTimes: pigeonData.dailyTimes,
              excluded: pigeonData.excluded,
              isHelper: pigeonData.isHelper || false,
            };
          }
        );

        // Calculate numberOfDays excluding days from excluded pigeons
        const validResults = results.filter((r) => {
          const pigeonData = data.pigeonTotals[1]; // Check first pigeon's data
          return r.pigeonOwnerId === ownerId && !pigeonData?.excluded;
        });

        return {
          ownerId,
          ownerName: owner ? owner.name : "Unknown Owner",
          numberOfDays: validResults.length,
          pigeons: pigeonResults,
          grandTotal,
          formattedGrandTotal: formatDuration(grandTotal),
        };
      })
    );

    const response = {
      tournamentId,
      totalOwners: finalResults.length,
      ownerResults: finalResults,
    };

    res?.status(200).json(response);
  } catch (error) {
    console.error("Error fetching tournament results:", error);
    res
      ?.status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Helper function to format seconds into HH:MM:SS
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "00:00:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(remainingSeconds).padStart(2, "0")}`;
}
