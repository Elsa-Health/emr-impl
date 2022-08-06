![ELSA HEALTH](https://www.elsa.health/elsa-logo.png)

## `@elsa-health/emr`

This is an node packages that contains would contain the "business logic" and other associated operations for the Elsa.Health medical use cases.

#### Elements of the package:

The packages has 3 main parts:

-   **Health data object functions** representing real world objects in a medical setting. (See [`/health.types/`](/health.types/)). Example: `Patient`, `Practitioner`, `Visit`
-   **Use case associated object types** that properly shows the shape of an object that's made to interact in some use case. Example, for `<ctc>` use case, you'd have the `ctc.Patient`, `ctc.Visit`, and `ctc.InvestigationRequest`, among others
-   Use case associated business logic to handle the execution of operations that that particular use case. Often this might also involve creating multiple objects that can be linked together as a consequence. Example; in the `<ctc>` use case, you might have a function `ctc.createNewVisit(ctc.Patient, ctc.Practitioner)` that returns `{ visit: ctc.Visit, appointmentRequest?: ctc.AppointmentRequest }`

Use cases covered used:

-   [x] CTC
-   [ ] Addo
-   [ ] Labs

## Usage

```ts
import { Patient } from "@elsa-health/emr";
import { registerNewPatient } from "@elsa-health/emr/lib/ctc";

// 1. creating patient object
const patient = Patient({
	id: "<random-uuid>",
	sex: "male",
	birthDate: "1998-09-27",
});

// 2. creating objects through logic
const { v4: generateId } = require("uuid");
const { patient, ...other } = registerNewPatient(
    generateId,
    "<patient-id>",
    "<doctor-id>",
    {
    	arvRegimens: [];
    	regimenDuration: "30-days";
    	medications: [];
    	appointmentDate: '12 / 09 / 2022';
    	dateOfVisit: '06 / 08 / 2022';
    	appointmentId: null;
    	visitType: "clinic";
    }
 );
```

## Get Started

### Scripts

#### `yarn dev`

#### `yarn test`

#### `yarn build`

## Developer Notice

These are the things to keep in-mind when adding the functions to the module for some part of the application.

-   Pure Functions
-   Idempotency should be observed when creating data objects

    ```ts
    const patient = Patient({
    	id: "<random-uuid>",
    	sex: "male",
    	birthDate: "1990-12-27",
    });

    // this should also work
    Patient(Patient(patient));
    ```
