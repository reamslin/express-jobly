const { sqlForPartialUpdate, sqlForCompanyFilters, sqlForJobFilters } = require("./sql");
const { BadRequestError } = require("../expressError")
describe("sqlForPartialUpdate", function () {
    test("Works with data provided and jsToSql object containing js field names", function () {
        const { setCols, values } = sqlForPartialUpdate({
            "FirstName": "first",
            "LastName": "last"
        }, {
            "FirstName": "first_name",
            "LastName": "last_name"
        });

        expect(setCols).toEqual("\"first_name\"=$1, \"last_name\"=$2");
        expect(values).toEqual(["first", "last"])
    });

    test("Works with data provided and empty jsToSql object", function () {
        const { setCols, values } = sqlForPartialUpdate({
            "first_name": "first",
            "last_name": "last"
        }, {});

        expect(setCols).toEqual("\"first_name\"=$1, \"last_name\"=$2");
        expect(values).toEqual(["first", "last"])
    });

    test("Throws bad request error with no data", function () {
        try {
            const { setCols, values } = sqlForPartialUpdate({}, {});
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

describe("sqlForCompanyFilters", function () {
    test("works with no filters", function () {
        const { conditions, values } = sqlForCompanyFilters({});
        expect(conditions).toEqual("");
        expect(values).toEqual([]);
    });
    test("works with maxEmployees filter", function () {
        const { conditions, values } = sqlForCompanyFilters({ "maxEmployees": 40 });
        expect(conditions).toEqual('WHERE num_employees <= $1');
        expect(values).toEqual([40]);
    });
    test("works with minEmployees filter", function () {
        const { conditions, values } = sqlForCompanyFilters({ "minEmployees": 40 });
        expect(conditions).toEqual('WHERE num_employees >= $1');
        expect(values).toEqual([40]);
    });
    test("works with nameLike filter", function () {
        const { conditions, values } = sqlForCompanyFilters({ "nameLike": "%a%" });
        expect(conditions).toEqual('WHERE name ILIKE $1');
        expect(values).toEqual(["%a%"]);
    });
    test("works with all filters", function () {
        const { conditions, values } = sqlForCompanyFilters({
            "maxEmployees": 40,
            "minEmployees": 20,
            "nameLike": "%a%"
        });
        expect(conditions).toEqual(`WHERE num_employees <= $1 AND num_employees >= $2 AND name ILIKE $3`);
        expect(values).toEqual([40, 20, "%a%"]);
    });
});

describe("sqlForJobFilters", function () {
    test("works with no filters", function () {
        const { conditions, values } = sqlForJobFilters({});
        expect(conditions).toEqual("");
        expect(values).toEqual([]);
    });
    test("works with minSalary filter", function () {
        const { conditions, values } = sqlForJobFilters({ "minSalary": 40 });
        expect(conditions).toEqual('WHERE salary >= $1');
        expect(values).toEqual([40]);
    });
    test("works with title filter", function () {
        const { conditions, values } = sqlForJobFilters({ "title": "%J4%" });
        expect(conditions).toEqual('WHERE title ILIKE $1');
        expect(values).toEqual(["%J4%"]);
    });
    test("works with hasEquity filter true", function () {
        const { conditions, values } = sqlForJobFilters({ "hasEquity": "true" });
        expect(conditions).toEqual('WHERE equity > 0');
        expect(values).toEqual([]);
    });
    test("works with hasEquity filter false", function () {
        const { conditions, values } = sqlForJobFilters({ "hasEquity": "false" });
        expect(conditions).toEqual("");
        expect(values).toEqual([]);
    });
    test("works with all filters", function () {
        const { conditions, values } = sqlForJobFilters({
            "minSalary": 40,
            "title": "%J4%",
            "hasEquity": "true"
        });
        expect(conditions).toEqual(`WHERE equity > 0 AND salary >= $1 AND title ILIKE $2`);
        expect(values).toEqual([40, '%J4%']);
    });
});