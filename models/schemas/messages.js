
/**
 * Messages database schema
 */
module.exports = {
  // PRIMARY KEY: according to node-orm2 documentation
  //   an unique messaged id `id` will be generated automatically

  // ASSOCIATION: with hasOne, getGroup will be id of group associated

  // user id of message sender TODO: replace with hasOne (maybe)
  user_id : { type: 'number'                                },
  // non-login author name when user_id not available
  author  : { type: 'text'                                  },
  // time of message sent
  create  : { type: 'date',   require: true,  time: true    },
  // body of message, with markdown support
  content : { type: 'text',   require: true,  big: true     }
};
