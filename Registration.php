<?php
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT); //to make sql throw errors

    require "Database.php"; //connects to the database
    session_start(); //for session variables

    //ensures that the code will only run when a submission is made
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        header("Location: Registration.html"); //change to final file
        exit;
    }

    //reads the input, i put it in a function for cleanliness
    function field(string $value): string {
        return trim($_POST[$value] ?? "");// ?? checks if there is an input. if empty, assign an empty string
    }

    $firstName = field("firstName");
    $lastName = field("lastName");
    $middleName = field("middleName");
    $suffix = field("suffix");
    $contactNumber = preg_replace("/\D/", "", field("contactNumber"));
    $cityAddress = field("cityAddress");

    $purpose = field("purpose") === "Other" ? field("purposeOther") : field("purpose");
    $office = field("office") === "Other" ? field("officeOther") : field("office");
    $idType = field("idType") === "Other" ? field("idTypeOther") : field("idType");
    
    if ($firstName === "" || $lastName === "" || $contactNumber === "" || $cityAddress === "" || $purpose === "" ||$office === "" ||$idType === "") {
        http_response_code(400);
        exit("Please fill in all required fields.");
    }

    $conn -> begin_transaction();//this is needed for commit and rollback

    try {
        //preparing the structure of the query before putting the actual values
        $stmt1 = $conn -> prepare(
            "INSERT INTO visitor_profiles (first_name, middle_name, last_name, suffix, contact_number, city_address)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt1 -> bind_param("ssssss", $firstName, $middleName, $lastName, $suffix, $contactNumber, $cityAddress); //binds the variables into the placeholders in the prep
        $stmt1 -> execute();//puts the data into database

        $visitorId = $conn -> insert_id;//takes the id assigned from the latest row made
        $referenceNo = "";
    
        $stmt2 = $conn -> prepare(
            "INSERT INTO log_entries (visitor_profile_id, client_submission_id, reference_no, purpose, office_to_visit)
             VALUES (?, ?, ?, ?, ?)"
        );
        $stmt2 -> bind_param("issss", $visitorId, $idType, $referenceNo, $purpose, $office);

        //to handle possible duplicate reference numbers
        $saved = false;
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $referenceNo = "VT" . date("Ymd") . "-" . random_int(10000, 99999);
            try {
                $stmt2 -> execute();
                $saved = true;
                break; //all goes well and the reference number is not a dup
            } catch (mysqli_sql_exception $e) { //if there is an error, we store it in the e
                if ($e -> getCode() !== 1062) { //we take the error code and check if it is not the dup error
                    throw $e;
                }
            }
        }

        if (!$saved) {
            throw new Exception ("Could not generate a unique reference number.");
        }

        $conn -> commit(); //finalizes the addition to the databaase. means all went well
    } catch (Throwable $e) {
        $conn -> rollback();//cancels everything since the transaction began
        http_response_code(500);
        exit("Something went wrong. Please try again.");

    }

    $_SESSION["referenceNo"] = $referenceNo; //so that the reference number can be used in the other page

    header("Location: ReferenceNumber.html"); //change to final file
    exit;
?>