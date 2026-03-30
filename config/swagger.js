const spec = {
  openapi: '3.0.0',
    info: {
      title: 'Sona Punjab API',
      version: '1.0.0',
      description: 'API documentation for Sona Punjab backend - Admin, Clubs, Pigeon Owners, Tournaments, Results, and Banners',
    },
    servers: [
      {
        url: (process.env.SWAGGER_SERVER_URL || '').replace(/\/$/, '') || '/',
        description:
          'API base (set SWAGGER_SERVER_URL in .env for a full URL, e.g. your Render app)',
      },
    ],
  tags: [
      { name: 'Admin', description: 'Admin registration, login, and management' },
      { name: 'Clubs', description: 'Club CRUD operations' },
      { name: 'Pigeon Owners', description: 'Pigeon owner management' },
      { name: 'Tournaments', description: 'Tournament management' },
      { name: 'Results', description: 'Tournament results' },
      { name: 'Banners', description: 'Banner management' },
    ],
  paths: {
      '/sona-punjab/register': {
        post: {
          tags: ['Admin'],
          summary: 'Register a new admin',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'password', 'role'],
                  properties: {
                    name: { type: 'string', example: 'Admin User' },
                    phone: { type: 'string', example: '9876543210' },
                    password: { type: 'string', example: 'password123' },
                    role: { type: 'string', enum: ['admin', 'subadmin'] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Admin registered successfully' },
            400: { description: 'Validation error or name already registered' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/login': {
        post: {
          tags: ['Admin'],
          summary: 'Admin login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'password'],
                  properties: {
                    name: { type: 'string' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful, returns user and token' },
            400: { description: 'Invalid credentials' },
            404: { description: 'Name not registered' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/all-admin': {
        get: {
          tags: ['Admin'],
          summary: 'Get all admins',
          responses: {
            200: { description: 'List of all admins' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/update-admin/{id}': {
        put: {
          tags: ['Admin'],
          summary: 'Update an admin',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Admin MongoDB ObjectId' },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    phone: { type: 'string' },
                    password: { type: 'string' },
                    role: { type: 'string', enum: ['admin', 'subadmin'] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Admin updated successfully' },
            400: { description: 'Invalid ID or validation error' },
            404: { description: 'Admin not found' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/delete-admin/{id}': {
        delete: {
          tags: ['Admin'],
          summary: 'Delete an admin',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Admin MongoDB ObjectId' },
          ],
          responses: {
            200: { description: 'Admin deleted successfully' },
            400: { description: 'Invalid ID' },
            404: { description: 'Admin not found' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/create-club': {
        post: {
          tags: ['Clubs'],
          summary: 'Create a club',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', example: 'Club Name' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Club created successfully' },
            400: { description: 'Club name required or already exists' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/get-all-clubs': {
        get: {
          tags: ['Clubs'],
          summary: 'Get all clubs',
          responses: {
            200: { description: 'List of all clubs' },
            404: { description: 'No clubs found' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/update-club/{clubId}': {
        put: {
          tags: ['Clubs'],
          summary: 'Update a club',
          parameters: [
            { name: 'clubId', in: 'path', required: true, schema: { type: 'string' }, description: 'Club MongoDB ObjectId' },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Club and associated tournaments updated' },
            400: { description: 'Validation error' },
            404: { description: 'Club not found' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/delete-club/{clubId}': {
        delete: {
          tags: ['Clubs'],
          summary: 'Delete a club',
          parameters: [
            { name: 'clubId', in: 'path', required: true, schema: { type: 'string' }, description: 'Club MongoDB ObjectId' },
          ],
          responses: {
            200: { description: 'Club deleted successfully' },
            404: { description: 'Club not found' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/owner': {
        post: {
          tags: ['Pigeon Owners'],
          summary: 'Create a pigeon owner',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['name', 'adminId'],
                  properties: {
                    name: { type: 'string' },
                    adminId: { type: 'string', description: 'Admin MongoDB ObjectId' },
                    address: { type: 'string' },
                    phone: { type: 'string' },
                    ownerPicture: { type: 'string', format: 'binary', description: 'Image file' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Pigeon owner created' },
            400: { description: 'Missing required fields or validation error' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/get-all-owner': {
        get: {
          tags: ['Pigeon Owners'],
          summary: 'Get all pigeon owners',
          responses: {
            200: { description: 'List of all pigeon owners' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/get-all-owner/{adminId}': {
        get: {
          tags: ['Pigeon Owners'],
          summary: 'Get pigeon owners by admin ID',
          parameters: [
            { name: 'adminId', in: 'path', required: true, schema: { type: 'string' }, description: 'Admin MongoDB ObjectId' },
          ],
          responses: {
            200: { description: 'List of pigeon owners for the admin' },
            400: { description: 'adminId required' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/single-owner/{ownerId}': {
        get: {
          tags: ['Pigeon Owners'],
          summary: 'Get a single pigeon owner by ID',
          parameters: [
            { name: 'ownerId', in: 'path', required: true, schema: { type: 'string' }, description: 'Owner MongoDB ObjectId' },
          ],
          responses: {
            200: { description: 'Pigeon owner details' },
            404: { description: 'Owner not found' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/update-owner/{ownerId}': {
        put: {
          tags: ['Pigeon Owners'],
          summary: 'Update a pigeon owner',
          parameters: [
            { name: 'ownerId', in: 'path', required: true, schema: { type: 'string' }, description: 'Owner MongoDB ObjectId' },
          ],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    address: { type: 'string' },
                    phone: { type: 'string' },
                    ownerPicture: { type: 'string', format: 'binary', description: 'Image file' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Pigeon owner updated' },
            404: { description: 'Owner not found' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/delete-owner/{ownerId}': {
        delete: {
          tags: ['Pigeon Owners'],
          summary: 'Delete a pigeon owner',
          parameters: [
            { name: 'ownerId', in: 'path', required: true, schema: { type: 'string' }, description: 'Owner MongoDB ObjectId' },
          ],
          responses: {
            200: { description: 'Pigeon owner deleted' },
            404: { description: 'Owner not found' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/tournaments': {
        post: {
          tags: ['Tournaments'],
          summary: 'Create a tournament',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['tournamentName', 'club', 'dates', 'numberOfDays', 'startTime', 'numberOfPigeons', 'continueDays', 'status'],
                  properties: {
                    tournamentName: { type: 'string' },
                    club: { type: 'string' },
                    tournamentPicture: { type: 'string', format: 'binary' },
                    tournamentInfo: { type: 'string' },
                    category: { type: 'string' },
                    dates: { type: 'array', items: { type: 'string' }, description: 'Array of date strings' },
                    numberOfDays: { type: 'number' },
                    startTime: { type: 'string' },
                    numberOfPigeons: { type: 'number' },
                    noteTimeForPigeons: { type: 'string' },
                    helperPigeons: { type: 'number' },
                    continueDays: { type: 'number' },
                    status: { type: 'string', enum: ['Active', 'Non-active'] },
                    type: { type: 'string' },
                    participatingLofts: { type: 'array', items: { type: 'string' } },
                    numberOfPrizes: { type: 'number' },
                    prizes: { type: 'array', items: { type: 'string' } },
                    allowedAdmins: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Tournament created' },
            400: { description: 'Validation error' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/get-tournaments': {
        get: {
          tags: ['Tournaments'],
          summary: 'Get all tournaments',
          responses: {
            200: { description: 'List of all tournaments' },
            404: { description: 'No tournaments found' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/get-allowed-tournaments/{subadminId}': {
        get: {
          tags: ['Tournaments'],
          summary: 'Get tournaments allowed for a subadmin',
          parameters: [
            { name: 'subadminId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'List of allowed tournaments' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/get-single-tournaments/{id}': {
        get: {
          tags: ['Tournaments'],
          summary: 'Get a single tournament by ID',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Tournament MongoDB ObjectId' },
          ],
          responses: {
            200: { description: 'Tournament details' },
            404: { description: 'Tournament not found' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/get-current-tournement': {
        get: {
          tags: ['Tournaments'],
          summary: 'Get tournaments for current month',
          responses: {
            200: { description: 'Tournaments for current month' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/get-all-tournament/{clubName}': {
        get: {
          tags: ['Tournaments'],
          summary: 'Get all tournaments by club name',
          parameters: [
            { name: 'clubName', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'List of tournaments for the club' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/get-active-tournament': {
        get: {
          tags: ['Tournaments'],
          summary: 'Get the active tournament',
          responses: {
            200: { description: 'Active tournament' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/tournaments/{id}': {
        put: {
          tags: ['Tournaments'],
          summary: 'Update a tournament',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Tournament MongoDB ObjectId' },
          ],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    tournamentName: { type: 'string' },
                    club: { type: 'string' },
                    tournamentPicture: { type: 'string', format: 'binary' },
                    tournamentInfo: { type: 'string' },
                    category: { type: 'string' },
                    dates: { type: 'array', items: { type: 'string' } },
                    numberOfDays: { type: 'number' },
                    startTime: { type: 'string' },
                    numberOfPigeons: { type: 'number' },
                    helperPigeons: { type: 'number' },
                    continueDays: { type: 'number' },
                    status: { type: 'string' },
                    participatingLofts: { type: 'array', items: { type: 'string' } },
                    numberOfPrizes: { type: 'number' },
                    prizes: { type: 'array', items: { type: 'string' } },
                    allowedAdmins: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Tournament updated' },
            404: { description: 'Tournament not found' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/delete-tournament/{id}': {
        delete: {
          tags: ['Tournaments'],
          summary: 'Delete a tournament',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Tournament MongoDB ObjectId' },
          ],
          responses: {
            200: { description: 'Tournament deleted' },
            404: { description: 'Tournament not found' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/results': {
        post: {
          tags: ['Results'],
          summary: 'Create or update tournament result',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['tournamentId', 'pigeonOwnerId', 'startTime', 'date', 'timeList'],
                  properties: {
                    tournamentId: { type: 'string', description: 'Tournament MongoDB ObjectId' },
                    pigeonOwnerId: { type: 'string', description: 'Pigeon owner MongoDB ObjectId' },
                    startTime: { type: 'string' },
                    date: { type: 'string' },
                    timeList: { type: 'array', items: { type: 'string' }, description: 'Array of times' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Result created or updated' },
            400: { description: 'All fields required or tournament not found' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/tournament-results/{tournamentId}/{date}': {
        get: {
          tags: ['Results'],
          summary: 'Get tournament results by tournament ID and date',
          parameters: [
            { name: 'tournamentId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'date', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Results for the tournament on the given date' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/tournament-single-results/{id}': {
        get: {
          tags: ['Results'],
          summary: 'Get a single result by ID',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Result MongoDB ObjectId' },
          ],
          responses: {
            200: { description: 'Result details' },
            404: { description: 'Result not found' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/tournament/{tournamentId}/owners': {
        get: {
          tags: ['Results'],
          summary: 'Get owners participating in a tournament',
          parameters: [
            { name: 'tournamentId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'List of participating owners' },
            404: { description: 'Tournament not found' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/tournament/{tournamentId}/results': {
        get: {
          tags: ['Results'],
          summary: 'Get tournament results by owner',
          parameters: [
            { name: 'tournamentId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Tournament owner results' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/banner': {
        post: {
          tags: ['Banners'],
          summary: 'Create a banner',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['bannerPicture'],
                  properties: {
                    bannerPicture: { type: 'string', format: 'binary', description: 'Banner image file' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Banner created successfully' },
            400: { description: 'No file uploaded' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/get-all-banner': {
        get: {
          tags: ['Banners'],
          summary: 'Get all banners',
          responses: {
            200: { description: 'List of all banners' },
            500: { description: 'Server error' },
          },
        },
      },
      '/sona-punjab/delete/{bannerId}': {
        delete: {
          tags: ['Banners'],
          summary: 'Delete a banner',
          parameters: [
            { name: 'bannerId', in: 'path', required: true, schema: { type: 'string' }, description: 'Banner MongoDB ObjectId' },
          ],
          responses: {
            200: { description: 'Banner and image deleted successfully' },
            404: { description: 'Banner or file not found' },
            500: { description: 'Server error' },
          },
        },
      },
    },
};

export default spec;
