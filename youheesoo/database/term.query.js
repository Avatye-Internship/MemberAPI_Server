const db = require("./pool");

exports.findAll = async () => {
  return db.execute("select * from term").then((data) => {
    return data[0];
    console.log(data[0]);
  });
};

exports.findById = async (name) => {
  return db
    .execute("select * from term where termName=?", [name])
    .then((data) => data[0]);
};

exports.createTerm = async (term) => {
  const { termName, termContent, isRequired } = term;
  return db
    .execute(
      "insert into term(termName, termContent, isRequired) values(?,?,?)",
      [termName, termContent, isRequired]
    )
    .then((data) => {
      return data[0].insertId;
    });
};

exports.createUserTerm = async (id, termName, isAgree) => {
  return db
    .execute("insert into userterm(userId, termName, isAgree) values(?,?,?)", [
      id,
      termName,
      isAgree,
    ])
    .then((data) => {
      console.log(data[0].insertId);
      return data[0].insertId;
    });
};

exports.agreeTerm = async (id, name, isAgree) => {
  return db
    .execute("update userterm set isAgree=? where userId=? and termName=?", [
      isAgree,
      id,
      name,
    ])
    .then((data) => {
      console.log(data[0]);
      return data[0];
    });
};
