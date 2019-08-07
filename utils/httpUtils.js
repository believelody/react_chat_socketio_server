const fetchDataSuccess = (res, data) => res.json(data);
const notFound = (res, msg) => res.status(404).json(msg);
const errorHandled = (res, errors) => res.status(401).json(errors);
const internalError = res => res.status(500).json("Something gone wrong!!!");

module.exports = { fetchDataSuccess, notFound, internalError, errorHandled };
