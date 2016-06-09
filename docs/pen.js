export default {

  id: String, // 6 characters.

  owner: {
    hash: String, // thesuitcase
    full: String, // The Suitcase
  },

  createdAt: Date,
  modifiedAt: Date,

  // Modernizer
  support: {
    // Same for more tests and css + js.
    html: {
      'header tag': {
        supported: {
          total: Number,
          // [browserName]: {
            // [browserVersionName]: Number,
          // }
        },
        unsupported: {
          total: 1,
          // [browserName]: {
            // [browserVersionName]: Number,
          // }
        },
      }
    }
  },

  history: {
    views: {
      // [day]: Number,
    },
    likes: {
      // [day]: Number,
    },
    comments: {
      // [day]: Number,
    },
    browsers: {
      // [day]: {
        // [browser]: {
          // [version]: Number,
        // }
      // }
    },
    devices: {
      // [day]: {
        // [device type] : Number
      // }
    },
    os: {
      // [day]: {
        // [os]: Number,
      // }
    },
    countries: {
      day: {
        // [country]: Number
      },
    },

    displays: {
      total: {
        // [size]: Number,
      },
      // [day]: {
        // [size]: Number,
      // }
    },

    // Rounded to an 100ish number.
    windows: {
      total: {
        // [size]: Number,
      },
      // [day]: {
        // [size]: Number,
      // }
    },

    engines: {
      total: {
        // [size]: Number,
      },
      // [day]: {
        // [size]: Number,
      // }
    }
  },

  achivements: {
    [achivement]: {
      day: Date,
    }
  }
}