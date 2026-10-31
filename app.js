// REPLACE WITH YOUR SUPABASE DETAILS
const SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("regForm");
const submitBtn = document.getElementById("submitBtn");
const btnText = submitBtn.querySelector(".btn-text");
const spinner = submitBtn.querySelector(".spinner");
const alertBox = document.getElementById("alertBox");
const successCard = document.getElementById("successCard");
const summaryBox = document.getElementById("regSummary");
const resetBtn = document.getElementById("resetBtn");

// Set default date to today
document.getElementById("regDate").value = new Date().toISOString().split("T")[0];

function showAlert(msg) {
  alertBox.className = "alert error";
  alertBox.textContent = msg;
  alertBox.classList.remove("hidden");
}

function clearAlert() {
  alertBox.classList.add("hidden");
  alertBox.textContent = "";
}

function setFieldError(id, msg) {
  document.getElementById(`err-${id}`).textContent = msg;
}

function clearFieldErrors() {
  document.querySelectorAll(".err-msg").forEach((el) => (el.textContent = ""));
}

function validateInputs(data) {
  let valid = true;
  clearFieldErrors();

  if (!data.fullName.trim()) {
    setFieldError("fullName", "Full name is required.");
    valid = false;
  }

  const phoneRegex = /^[+]?[\d\s-]{8,15}$/;
  if (!phoneRegex.test(data.mobile.trim())) {
    setFieldError("mobile", "Please enter a valid phone number (min 8 digits).");
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email.trim())) {
    setFieldError("email", "Please enter a valid email address.");
    valid = false;
  }

  if (!data.gender) {
    setFieldError("gender", "Please select your gender.");
    valid = false;
  }

  const ageNum = parseInt(data.age, 10);
  if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
    setFieldError("age", "Age must be between 1 and 120.");
    valid = false;
  }

  if (!data.address.trim()) {
    setFieldError("address", "Address is required.");
    valid = false;
  }

  if (!data.city.trim()) {
    setFieldError("city", "City is required.");
    valid = false;
  }

  if (!data.state.trim()) {
    setFieldError("state", "State is required.");
    valid = false;
  }

  if (!data.regDate) {
    setFieldError("regDate", "Registration date is required.");
    valid = false;
  }

  return valid;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAlert();

  const formData = {
    fullName: form.fullName.value,
    mobile: form.mobile.value,
    email: form.email.value,
    gender: form.gender.value,
    age: form.age.value,
    address: form.address.value,
    city: form.city.value,
    state: form.state.value,
    regDate: form.regDate.value,
    additionalInfo: form.additionalInfo.value,
  };

  if (!validateInputs(formData)) {
    return;
  }

  submitBtn.disabled = true;
  btnText.textContent = "Saving to Database...";
  spinner.classList.remove("hidden");

  try {
    const payload = {
      full_name: formData.fullName.trim(),
      mobile: formData.mobile.trim(),
      email: formData.email.trim().toLowerCase(),
      gender: formData.gender,
      age: parseInt(formData.age, 10),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      registration_date: new Date(formData.regDate).toISOString(),
      additional_information: formData.additionalInfo.trim(),
    };

    const { data, error } = await supabase.from("registrations").insert([payload]).select();

    if (error) {
      throw error;
    }

    form.classList.add("hidden");
    successCard.classList.remove("hidden");
    summaryBox.innerHTML = `
      <strong>Name:</strong> ${payload.full_name}<br/>
      <strong>Email:</strong> ${payload.email}<br/>
      <strong>Mobile:</strong> ${payload.mobile}<br/>
      <strong>City, State:</strong> ${payload.city}, ${payload.state}<br/>
      <strong>Registration Date:</strong> ${payload.registration_date.split("T")[0]}
    `;
  } catch (err) {
    showAlert(`Submission failed: ${err.message || "Network error. Please try again."}`);
  } finally {
    submitBtn.disabled = false;
    btnText.textContent = "Submit Registration";
    spinner.classList.add("hidden");
  }
});

resetBtn.addEventListener("click", () => {
  form.reset();
  document.getElementById("regDate").value = new Date().toISOString().split("T")[0];
  successCard.classList.add("hidden");
  form.classList.remove("hidden");
  clearFieldErrors();
  clearAlert();
});
