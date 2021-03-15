const { BadRequestError } = require("../expressError");

/** Format sql query parameterization based on given fields and values to update
 * takes in object containing fields and values, and object mapping js field names to sql field names 
 * 
 * returns a string of columns to set in sql with sql parameters
 * and an array of values to pass with the sql query to supply the sql parameters
 * 
 * data, jsToSql -> { setCols(string), values(array) }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/** Format WHERE clause for getting companies using supported filters
 * takes in filters object, returns object containing parameterized WHERE clause, and values to supply to query
 * 
 * {filter...} -> { conditions(string), values(array) }
 * 
 * supports: maxEmployees, minEmployees, nameLike
 * 
 * caller must ensure only supported filters are passed
 */
function sqlForCompanyFilters(filters) {
  const keys = Object.keys(filters);
  if (keys.length === 0) return {
    conditions: "",
    values: []
  };

  const conditions = keys.map((filterName, idx) => {
    if (filterName === "maxEmployees") {
      return `num_employees <= $${idx + 1}`
    } else if (filterName === "minEmployees") {
      return `num_employees >= $${idx + 1}`
    } else if (filterName === "nameLike") {
      return `name ILIKE $${idx + 1}`
    };
  });

  return {
    conditions: `WHERE ${conditions.join(" AND ")}`,
    values: Object.values(filters)
  }
}

/** Format WHERE clause for getting jobs using supported filters
 * takes in filters object, returns object containing parameterized WHERE clause, and values to supply to query
 * 
 * {filter...} -> { conditions(string), values(array) }
 * 
 * supports: title, minSalary, hasEquity
 * 
 * caller must ensure only supported filters are passed
 */
function sqlForJobFilters(filters) {
  const keys = Object.keys(filters);
  if (keys.length === 0) return {
    conditions: "",
    values: []
  };

  const conditions = [];
  const values = [];
  let idx = 1;

  if (filters.hasOwnProperty('hasEquity')) {
    if (filters.hasEquity === "true") {
      conditions.push(`equity > 0`)
    } else {
      conditions.push("")
    }
  }

  if (filters.hasOwnProperty("minSalary")) {
    conditions.push(`salary >= $${idx}`);
    values.push(filters.minSalary);
    idx += 1;
  }

  if (filters.hasOwnProperty("title")) {
    conditions.push(`title ILIKE $${idx}`);
    values.push(filters.title);
  }

  conditionString = conditions.filter(Boolean).join(" AND ");
  if (conditionString != "") {
    conditionString = `WHERE ${conditionString}`
  }

  return {
    conditions: conditionString,
    values
  }
}

module.exports = { sqlForPartialUpdate, sqlForCompanyFilters, sqlForJobFilters };
