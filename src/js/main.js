let url = "https://dt207g-mongodb-api.onrender.com/jobs";

// Funktion för att hämta data från API
async function getData() {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    iterateData(data);
}

getData();

// Funktion för att skriva ut data till DOM
function iterateData(data) {
    const joblistContainer = document.querySelector(".joblist");
    data.forEach((job) => {
        const jobElement = createJobElement(job);
        joblistContainer.appendChild(jobElement);
    });
}

// Funktion för att skapa HTML-element för ett jobb
function createJobElement(job) {
    const jobElement = document.createElement("div");
    jobElement.classList.add("job");
    const endDateText = job.enddate ? job.enddate.substring(0, 10) : "Pågående";
    jobElement.innerHTML = `
        <div>
            <h3>${job.jobtitle} @ ${job.company}</h3>
            <h4>${job.startdate.substring(0, 10)} - ${endDateText}</h4>
            <p>${job.description}</p>
            <button class="deleteBtn" data-id="${job._id}">Radera</button>
        </div>
    `;
    const deleteBtn = jobElement.querySelector(".deleteBtn");
    deleteBtn.addEventListener("click", () => deleteJob(job._id, jobElement));
    return jobElement;
}

// Funktion för att radera jobb från API
async function deleteJob(id, jobElement) {
    const response = await fetch(url + "/" + id, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!response.ok) {
        console.error("Unable to delete job");
        return;
    }
    jobElement.parentNode.removeChild(jobElement);
}

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.querySelector("#myModal");
    const btn = document.querySelector("#myBtn");
    const closeBtn = document.querySelector(".close");

    if (modal && btn && closeBtn) {
        btn.addEventListener("click", () => modal.style.display = "block");
        closeBtn.addEventListener("click", () => modal.style.display = "none");
        window.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    }

    // Hämta formulärfältens element
    const form = document.querySelector(".form");
    const companyNameInput = document.querySelector("#company");
    const jobtitleInput = document.querySelector("#jobtitle");
    const locationInput = document.querySelector("#location");
    const startdateInput = document.querySelector("#startdate");
    const enddateInput = document.querySelector("#enddate");
    const descriptionInput = document.querySelector("#description");
    const ongoingCheckbox = document.querySelector("#ongoing");
    const submitBtn = document.querySelector(".button");

    // Lägg till eventlyssnare för att visa felmeddelanden när fält får fokus
    let inputs = [companyNameInput, jobtitleInput, locationInput, startdateInput];
    const errors = {
        company: document.querySelector("#companyError"),
        jobtitle: document.querySelector("#jobtitleError"),
        location: document.querySelector("#locationError"),
        startdate: document.querySelector("#startdateError")
    };

    inputs.forEach(input => {
        input.addEventListener("focus", () => {
            const error = errors[input.id];
            if (input.value.trim() === "") {
                error.textContent = "Fyll i " + input.previousElementSibling.textContent.toLowerCase();
            }
        });
        input.addEventListener("input", () => {
            errors[input.id].textContent = "";
            submitBtn.disabled = !validateForm();
        });
    });

    // Funktion för att validera formuläret
    function validateForm() {
        return inputs.every(input => input.value.trim() !== "");
    }

    // Eventlyssnare vid submit av formulär som skapar objekt och skickar till API
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        let inputs = [companyNameInput, jobtitleInput, locationInput, startdateInput, enddateInput, descriptionInput, ongoingCheckbox];

        const companyName = companyNameInput.value;
        const jobtitle = jobtitleInput.value;
        const location = locationInput.value;
        const startdate = startdateInput.value;
        const enddate = enddateInput.value;
        const description = descriptionInput.value;

        const workExperience = {
            company: companyName,
            jobtitle: jobtitle,
            location: location,
            startdate: startdate,
            enddate: enddate,
            description: description,
        };

        if (ongoingCheckbox.checked) {
            workExperience.enddate = null;
            ongoingCheckbox.checked = false;
        }

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(workExperience),
            });
            const data = await response.json();
            console.log(data);
            iterateData([data]);
        } catch (error) {
            console.error("Error:", error);
        }

        // Återställ formulärfält
        inputs.forEach(input => input.value = "");
        modal.style.display = "none";
    });
});