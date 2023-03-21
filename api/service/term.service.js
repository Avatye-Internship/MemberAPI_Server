const {
  findAll,
  findById,
  createUserTerm,
  agreeTerm,
  createTerm,
} = require("../../database/term.query");

module.exports = {
  getTerms: async (req, res, next) => {
    try {
      const terms = await findAll();
      return terms;
    } catch (error) {
      console.log(error);
    }
  },

  getTerm: async (name) => {
    try {
      const term = await findById(name);
      return term;
    } catch (error) {}
  },

  createTerm: async (term) => {
    try {
      const newterm = await createTerm(term);
      return newterm;
    } catch (error) {}
  },

  createUserTerm: async (terms, id) => {
    try {
      for (var name in terms) {
        await createUserTerm(id, name, terms[name]);
      }
    } catch (error) {
      console.log(error);
    }
  },

  updateUserTerm: async (id, name, isAgree) => {
    try {
      return await agreeTerm(id, name, isAgree);
    } catch (error) {
      console.log(error);
    }
  },
};
