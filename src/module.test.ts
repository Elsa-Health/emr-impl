import { Module } from "./module";
import { getMockedStore } from "../__mocks__/dummy-store";

const mockedStore = getMockedStore("SOMETHING");

test("Module", () => {
	const collection = jest
		.fn()
		.mockImplementation((store: any, name: any) => name);
	// ...
	const module = new Module({
		patients: collection(mockedStore, "this-is-patients"),
		visits: collection(mockedStore, "this-is-visits"),
	});

	expect(module.collection("patients")).toBe("this-is-patients");
	expect(module.collection("visits")).toBe("this-is-visits");
});
