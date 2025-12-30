async function signup() {
  const message = document.getElementById("message");
  message.textContent = "";

  // 1️⃣ Collect form data
  const data = {
    username: document.getElementById("username").value.trim(),
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    dob: document.getElementById("dob").value,
    email: document.getElementById("email").value.trim(),
    address: document.getElementById("address").value.trim(),
    gender: document.getElementById("gender").value,
    department: document.getElementById("department").value,
    password: document.getElementById("password").value
  };

  // 2️⃣ Basic frontend validation (optional but professional)
  for (const key in data) {
    if (!data[key]) {
      message.style.color = "#c62828";
      message.textContent = "Please fill all required fields";
      return;
    }
  }

  try {
    // 3️⃣ Send request
    const res = await fetch("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    // 4️⃣ Handle errors
    if (!res.ok) {
      message.style.color = "#c62828";
      message.textContent = result.error || "Signup failed";
      return;
    }

    // 5️⃣ Success (pending approval)
    message.style.color = "#f57c00";
    message.textContent =
      "Signup successful. Your account is pending admin approval.";

    // 6️⃣ Optional: clear form (nice UX)
    document.querySelectorAll("input, textarea, select").forEach(el => {
      el.value = "";
    });

  } catch (err) {
    message.style.color = "#c62828";
    message.textContent = "Network error. Please try again.";
  }
}
