const db = require("./pool");

exports.findAll = async () => {
  // let query = "select * from user"

  return db
    .execute(
      "select id, loginId, userName, email, profileImgUrl, phone, gender, roleType, providerType, gradeId, createdAt, updatedAt from user where isDeleted = false"
    )
    .then((data) => {
      return data[0];
    });
};

exports.findById = async (id) => {
  return db
    .execute("select * from user where id=? and isDeleted = false", [id])
    .then((data) => data[0][0]);
};

exports.createLocalUser = async (user, pwd) => {
  const { userName, email, profileImgUrl, phone, gender, loginId, roleType } =
    user;
  return db
    .execute(
      "insert into user(userName, pwd, email, profileImgUrl, phone, gender, loginId, roleType) values(?,?,?,?,?,?,?,?)",
      [userName, pwd, email, profileImgUrl, phone, gender, loginId, roleType]
    )
    .then((data) => {
      return data[0].insertId;
    });
};

exports.createSocialUser = async (userReq) => {
  const { userName, email, loginId, providerType } = userReq;
  return db
    .execute(
      "insert into user(userName, email, loginId, providerType) values(?,?,?,?)",
      [userName, email, loginId, providerType]
    )
    .then((data) => {
      return data[0].insertId;
    });
};

exports.updateUser = async (id, user) => {
  const { userName, email, profileImgUrl, phone, gender, roleType } = user;
  return db
    .execute(
      "update user set userName=?, email=?, profileImgUrl=?, phone=?, gender=? roleType=? where id=?",
      [userName, email, profileImgUrl, phone, gender, roleType, id]
    )
    .then((data) => {
      return data[0];
    });
};

exports.updateUserGrade = async (id, grade) => {
  return db
    .execute("update user set gradeId=? where id=?", [grade, id])
    .then((data) => {
      return data[0];
    });
};

exports.updateGrade = async (id, grade) => {
  const { gradeName, dcRate, dcPrice } = grade;
  return db
    .execute("update grade set gradeName=?, dcRate=?, dcPrice=? where id=?", [
      gradeName,
      dcRate,
      dcPrice,
      id,
    ])
    .then((data) => {
      return data[0];
    });
};

exports.updatePwd = async (id, pwd) => {
  return db
    .execute("update user set pwd=? where id=?", [pwd, id])
    .then((data) => {
      return data[0];
    });
};

exports.findGradeById = async (id, grade) => {
  return db.execute("select * from grade where id=?", [id]).then((data) => {
    return data[0][0];
  });
};

exports.deleteUser = async (id) => {
  return db
    .execute("update user set isDeleted=True where id=?", [id])
    .then((data) => {
      return data[0];
    });
};

exports.findByEmail = async (email) => {
  return db
    .execute("select * from user where email=?", [email])
    .then((data) => data[0][0]);
};

exports.findByLoginId = async (id) => {
  console.log(id);
  return db
    .execute("select * from user where loginId=? and isDeleted=false", [id])
    .then((data) => {
      return data[0][0];
    });
};

exports.findBySocialId = async (id, providerType) => {
  return db
    .execute(
      "select * from user where loginId=? and providerType=? and isDeleted=false",
      [id, providerType]
    )
    .then((data) => {
      return data[0][0];
    });
};
