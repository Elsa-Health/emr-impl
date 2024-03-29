/**
 * Test associated with creating different fullfilling
 * different types of flows throughout the app
 */

import { collection, doc, getStore, setDoc } from "papai/collection";
import ItemStorage from "papai/stores/collection/ItemStorage";

import {
	createDataForSimpleVisit,
	editDataFromSimpleVisit,
	registerNewPatient,
} from "../../src/ctc/ctc";
import * as ctc from "../../src/ctc/ctc";

import {
	executeChain,
	prepareLazyExecutors,
	runTransaction,
} from "../../src/ctc/store";
import { addDays, format } from "date-fns";
import { Organization } from "../../src/object";
import { getMockedStore, generateId } from "../../__mocks__/dummy-store";

/**
 * Id generator
 * @returns
 */
// const generateId = () =>
// 	Buffer.from(`${Math.random() * 1000}-idx-${new Date().getTime()}`).toString(
// 		"hex"
// 	);

// const actualStore = new Map();
// const STORE_NAME = "JEST_MOCKING_STORE";
// // Mocking storage
// const mockedStore = getStore(
// 	ItemStorage(
// 		{
// 			nameReference: STORE_NAME,
// 			store: {
// 				getItem: async (ref) => actualStore.get(ref) ?? null,
// 				multiGet: async (refs) =>
// 					refs.map(
// 						(ref) =>
// 							[ref, actualStore.get(ref) ?? null] as [string, any]
// 					),
// 				setItem: async (ref, data) => {
// 					actualStore.set(ref, data);
// 				},
// 				multiSet: async (kvps) => {
// 					kvps.forEach(([k, v]) => actualStore.set(k, v));
// 				},
// 				multiRemove: async (ref) =>
// 					ref.forEach((ref) => actualStore.delete(ref)),
// 				removeItem: async (ref) => {
// 					actualStore.delete(ref);
// 				},
// 			},
// 			getCollRef: (ref) => `${STORE_NAME}/${ref.collectionId}`,
// 			getDocRef: (ref) =>
// 				`${STORE_NAME}/${ref.collectionId}/${ref.documentId}`,
// 		},
// 		// generate
// 		generateId
// 	)
// );
const mockedStore = getMockedStore("JEST_MOCKING_STORE");

// collections

const visits = collection(mockedStore, "visits");
const apptRequests = collection(mockedStore, "appt-requests");
const apptResponses = collection(mockedStore, "appt-responses");
const medicationRequests = collection(mockedStore, "medication-requests");

/**
 * FLOW / creating and storing an app visit
 */

describe("Visit Creation", () => {
	const fakePatientId = `patient-${generateId()}`;
	const fakeDoctorId = `doctor-${generateId()}`;
	const fakeOrganization = Organization<ctc.Organization>({
		id: `org-${generateId()}`,
		identifier: {
			ctcCode: "12312323",
		},
		name: "Some fancy place",
	});

	test("custom data that failed on run", () => {
		const data = registerNewPatient(
			generateId,
			{
				dateOfBirth: "21 / 02 / 1994",
				dateOfTest: "14 / 02 / 1992",
				dateStartedARVs: "",
				familyName: "Fury",
				firstName: "Mike",
				hasPatientOnARVs: false,
				hasPositiveTest: true,
				hasTreatmentSupport: true,
				maritalStatus: "Single",
				patientId: "11111111111121",
				phoneNumber: "",
				resident: "Arusha",
				sex: "female",
				typeOfSupport: "Partner / Spouse",
				whoStage: "Stage 3",
			},
			fakeDoctorId,
			[],
			fakeOrganization
		);
	});

	describe("WITHOUT without previous appointment", () => {
		const dataWoAppt = createDataForSimpleVisit(
			generateId,
			fakePatientId,
			fakeDoctorId,
			{
				appointmentDate: format(addDays(new Date(), 3), "dd/MM/yyyy"),
				appointmentId: null,
				arvRegimens: [],
				dateOfVisit: format(new Date(), "dd/MM/yyyy"),
				investigations: [],
				medications: ["acetaminophen", "acyclovir"],
				regimenDuration: "60-days",
				visitType: "community",
			}
		);

		test("data outputs", () => {
			expect(dataWoAppt).toMatchObject({
				visit: expect.any(Object),
				appointmentRequest: expect.any(Object),
				medicationRequests: expect.arrayContaining([
					expect.objectContaining({
						resourceType: "MedicationRequest",
					}),
				]),
				appointmentResponse: null,
			});
		});

		// Save the data to storage
		test("Save visit data to store", () => {
			const genId = (data: any) => (data?.id ?? generateId()) as string;

			// run multiple save operations
			const visit = prepareLazyExecutors(genId, visits);
			const apptRes = prepareLazyExecutors(genId, apptResponses);
			const apptReq = prepareLazyExecutors(genId, apptRequests);
			const medReq = prepareLazyExecutors(genId, medicationRequests);

			expect(
				executeChain([
					// save visit
					visit(({ set }) =>
						set([dataWoAppt.visit.id, dataWoAppt.visit])
					),
					() => console.log("Done!"),
					// save appointment request
					apptRes(({ add }) => add(dataWoAppt.appointmentRequest)),

					// save medication requests
					medReq(({ multiAdd }) =>
						multiAdd(dataWoAppt.medicationRequests)
					),

					() =>
						runTransaction(generateId, apptResponses, ({ add }) =>
							add(dataWoAppt.appointmentRequest)
						),
				])
			).resolves.toBeUndefined();
		});
	});

	test("WITH previous appointment", () => {
		const data = createDataForSimpleVisit(
			generateId,
			fakePatientId,
			fakeDoctorId,
			{
				appointmentDate: format(addDays(new Date(), 3), "dd/MM/yyyy"),
				appointmentId: `appt-request-${generateId()}`,
				arvRegimens: [],
				dateOfVisit: format(new Date(), "dd/MM/yyyy"),
				investigations: [],
				medications: ["acetaminophen", "acyclovir"],
				regimenDuration: "60-days",
				visitType: "community",
			}
		);

		expect(data).toMatchObject({
			visit: expect.any(Object),
			appointmentRequest: expect.any(Object),
			medicationRequests: expect.arrayContaining([
				expect.objectContaining({
					resourceType: "MedicationRequest",
				}),
			]),
			appointmentResponse: expect.objectContaining({
				resourceType: "AppointmentResponse",
			}),
		});
	});
});

describe("Edit Visit", () => {
	const fakePatientId = `patient-${generateId()}`;
	const fakeDoctorId = `doctor-${generateId()}`;

	const { visit } = createDataForSimpleVisit(
		generateId,
		fakePatientId,
		fakeDoctorId,
		{
			appointmentDate: format(addDays(new Date(), 3), "dd/MM/yyyy"),
			appointmentId: null,
			arvRegimens: [],
			dateOfVisit: format(new Date(), "dd/MM/yyyy"),
			investigations: ["blood-culture"],
			medications: ["acetaminophen", "acyclovir"],
			regimenDuration: "60-days",
			visitType: "community",
		}
	);
	test("update visit", () => {
		const { updatedVisit, medicationRequests } = editDataFromSimpleVisit(
			generateId,
			fakePatientId,
			fakeDoctorId,
			{
				medications: ["acetaminophen", "amoxicillin-oral-suspension"],
			},
			visit
		);

		// There can only be one medication request created from this
		expect(medicationRequests.length).toEqual(1);
	});
});
