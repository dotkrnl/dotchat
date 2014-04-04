
/**
 * Groups database schema
 */
module.exports = {
  // PRIMARY KEY: according to node-orm2 documentation
  //   an unique group id `id` will be generated automatically

  // ASSOCIATION: with hasOne, getMessages will be id of messages associated

  // unique group name used in url
  name    : { type: 'text',   require: true,  unique: true  },
  // group title showed in web page as title
  title   : { type: 'text',   require: true                 },
  // user id of group administrator, TODO: replace with hasOne
  user_id : { type: 'number'                                },
  // time of group created
  create  : { type: 'date',   require: true,  time: true    },
  // secret shared for group joining in
  secret  : { type: 'text',   require: true                 }
};
