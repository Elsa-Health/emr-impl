import { generateId } from "../__mocks__/dummy-store";
import * as X from "./object";
import { date, utcDateString } from "./utils";

const id = generateId;
test("objects here!", () => {
	// ...
	const patient = X.Patient({
		id: id(),
		birthDate: "12 / 05 / 2015",
		sex: "female",
	});
	expect(patient).toBeDefined();

	const org = X.Organization({
		id: id(),
		name: "Something",
		identifier: { ctc: "asdsads" },
	});
	expect(org).toBeDefined();

	const practitioner = X.Practitioner({
		id: id(),
		birthDate: "12 / 05 / 2015",
		organization: org,
		name: "Micheal John",
	});
	expect(practitioner).toBeDefined();

	expect(
		X.Visit({
			id: id(),
			date: utcDateString(),
			subject: patient,
		})
	).toBeDefined();

	expect(
		X.Medication(
			{ form: "tablets", identifier: "secret-medication" },
			X.Ingredient
		)
	).toBeDefined();
});
