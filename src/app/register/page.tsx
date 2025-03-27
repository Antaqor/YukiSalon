"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

/** Helper validations **/
// Accepts either 8 digits (e.g. 94641031) or optional "+" plus 8–15 digits
const isValidPhoneNumber = (phone: string) => {
    const regex = /^\+?\d{8,15}$/;
    return regex.test(phone);
};

const isValidPassword = (password: string) => {
    return password.length >= 6;
};

export default function RegisterMultiStepPage() {
    const router = useRouter();

    // ---------- STEP CONTROL ----------
    // step 1: basic info; step 1.5: phone verification; step 2: additional details
    const [step, setStep] = useState(1);

    // ---------- STEP 1 FIELDS ----------
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [birthMonth, setBirthMonth] = useState("");
    const [birthDay, setBirthDay] = useState("");
    const [birthYear, setBirthYear] = useState("");

    // New: Phone verification fields
    const [verificationSent, setVerificationSent] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");

    // ---------- STEP 2 FIELDS ----------
    const [password, setPassword] = useState("");
    const [gender, setGender] = useState("");
    const [location, setLocation] = useState("");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);

    // ---------- GENERAL UI STATES ----------
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ---------- FIELD-SPECIFIC ERRORS ----------
    const [fieldErrors, setFieldErrors] = useState<{
        [key: string]: string;
    }>({
        name: "",
        phoneNumber: "",
        birthMonth: "",
        birthDay: "",
        birthYear: "",
        password: "",
        gender: "",
        location: "",
        profilePicture: "",
        verificationCode: "",
    });

    const BASE_URL = "https://vone.mn";

    // ------------------------------------------------------------------
    // STEP 1: Validate Basic Fields & Send Verification Message
    // ------------------------------------------------------------------
    const handleNext = async () => {
        setError("");
        setSuccess("");
        setFieldErrors({
            name: "",
            phoneNumber: "",
            birthMonth: "",
            birthDay: "",
            birthYear: "",
            password: "",
            gender: "",
            location: "",
            profilePicture: "",
            verificationCode: "",
        });

        const errors: { [key: string]: string } = {};

        if (!name.trim()) {
            errors.name = "Нэрээ оруулна уу.";
        }
        if (!isValidPhoneNumber(phoneNumber)) {
            errors.phoneNumber = "Утасны дугаар буруу байна.";
        }
        if (!birthMonth) {
            errors.birthMonth = "Төрсөн сарыг сонгоно уу.";
        }
        if (!birthDay) {
            errors.birthDay = "Төрсөн өдрийг сонгоно уу.";
        }
        if (!birthYear) {
            errors.birthYear = "Төрсөн жилийг сонгоно уу.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors((prev) => ({ ...prev, ...errors }));
            return;
        }

        // Send verification SMS
        try {
            const res = await axios.post(`${BASE_URL}/api/auth/sendVerification`, {
                phoneNumber,
            });
            if (res.status === 200) {
                setSuccess("Баталгаажуулах код илгээлээ. Та кодоо оруулна уу.");
                setVerificationSent(true);
            }
        } catch (err: any) {
            console.error("Verification send error:", err);
            setError(err.response?.data?.error || "Баталгаажуулах код илгээхэд алдаа гарлаа.");
        }
    };

    // ------------------------------------------------------------------
    // Phone Verification: Check the code sent via SMS
    // ------------------------------------------------------------------
    const handleVerify = async () => {
        setError("");
        setSuccess("");
        setFieldErrors((prev) => ({ ...prev, verificationCode: "" }));

        if (!verificationCode.trim()) {
            setFieldErrors((prev) => ({
                ...prev,
                verificationCode: "Баталгаажуулах кодоо оруулна уу.",
            }));
            return;
        }

        try {
            const res = await axios.post(`${BASE_URL}/api/auth/verifyCode`, {
                phoneNumber,
                verificationCode,
            });
            if (res.status === 200 && res.data.verified === true) {
                setSuccess("Утасны дугаар баталгаажлаа.");
                // Proceed to next step (Step 2)
                setStep(2);
            } else {
                setError("Баталгаажуулах код буруу байна.");
            }
        } catch (err: any) {
            console.error("Verification error:", err);
            setError(err.response?.data?.error || "Баталгаажуулах код шалгахад алдаа гарлаа.");
        }
    };

    // ------------------------------------------------------------------
    // STEP 2: Validate Additional Fields & Final Submit
    // ------------------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setFieldErrors({
            name: "",
            phoneNumber: "",
            birthMonth: "",
            birthDay: "",
            birthYear: "",
            password: "",
            gender: "",
            location: "",
            profilePicture: "",
            verificationCode: "",
        });

        const errors: { [key: string]: string } = {};

        if (!isValidPassword(password)) {
            errors.password = "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.";
        }
        if (!gender.trim()) {
            errors.gender = "Хүйсээ сонгоно уу.";
        }
        if (!location.trim()) {
            errors.location = "Байршлаа оруулна уу.";
        }
        if (!profilePicture) {
            errors.profilePicture = "Профайл зураг оруулна уу.";
        } else if (!profilePicture.type.startsWith("image/")) {
            errors.profilePicture = "Буруу зураг файл. Зөв зураг оруулна уу.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors((prev) => ({ ...prev, ...errors }));
            return;
        }

        // Construct final form data
        try {
            const formData = new FormData();

            // Step 1 data
            formData.append("name", name);
            formData.append("phoneNumber", phoneNumber);
            formData.append(
                "birthday",
                JSON.stringify({
                    year: birthYear,
                    month: birthMonth,
                    day: birthDay,
                })
            );

            // Step 2 data
            formData.append("password", password);
            formData.append("gender", gender);
            formData.append("location", location);
            formData.append("profilePicture", profilePicture!);

            const res = await axios.post(`${BASE_URL}/api/auth/register`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.status === 201) {
                setSuccess("Ажилттай бүртгэл үүсгэлээ");
                // Clear all fields and reset state
                setStep(1);
                setName("");
                setPhoneNumber("");
                setBirthMonth("");
                setBirthDay("");
                setBirthYear("");
                setPassword("");
                setGender("");
                setLocation("");
                setProfilePicture(null);
                setVerificationSent(false);
                setVerificationCode("");
            }
        } catch (err: any) {
            console.error("Register error:", err);
            setError(err.response?.data?.error || "Бүртгэлийн алдаа гарлаа");
        }
    };

    // ---------- Utility: conditional className for inputs/selects ----------
    const getInputClass = (fieldName: string) => {
        return `w-full rounded-md px-3 py-2 text-white bg-[#111] focus:outline-none focus:ring-2 ${
            fieldErrors[fieldName]
                ? "border border-red-500 focus:ring-red-500"
                : "border border-gray-700 focus:ring-gray-500"
        }`;
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6">
                {error && <p className="text-red-600">{error}</p>}
                {success && <p className="text-green-600">{success}</p>}

                {step === 1 && (
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                        <h1 className="text-3xl font-bold text-white">Create your account</h1>

                        {/* NAME */}
                        <div>
                            <label className="block font-medium text-white mb-1">Name</label>
                            <input
                                type="text"
                                className={getInputClass("name")}
                                placeholder="Tesudei"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            {fieldErrors.name && (
                                <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
                            )}
                        </div>

                        {/* PHONE NUMBER */}
                        <div>
                            <label className="block font-medium text-white mb-1">Phone number</label>
                            <input
                                type="text"
                                className={getInputClass("phoneNumber")}
                                placeholder="94641031"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                            {fieldErrors.phoneNumber && (
                                <p className="text-red-500 text-sm mt-1">{fieldErrors.phoneNumber}</p>
                            )}
                        </div>

                        {/* DATE OF BIRTH */}
                        <div>
                            <label className="block font-medium text-white mb-1">Date of birth</label>
                            <p className="text-xs text-gray-400 mb-2">
                                This will not be shown publicly. Confirm your own age.
                            </p>
                            <div className="flex space-x-2">
                                <select
                                    className={getInputClass("birthMonth")}
                                    value={birthMonth}
                                    onChange={(e) => setBirthMonth(e.target.value)}
                                >
                                    <option value="">Month</option>
                                    {[
                                        "January",
                                        "February",
                                        "March",
                                        "April",
                                        "May",
                                        "June",
                                        "July",
                                        "August",
                                        "September",
                                        "October",
                                        "November",
                                        "December",
                                    ].map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className={getInputClass("birthDay")}
                                    value={birthDay}
                                    onChange={(e) => setBirthDay(e.target.value)}
                                >
                                    <option value="">Day</option>
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className={getInputClass("birthYear")}
                                    value={birthYear}
                                    onChange={(e) => setBirthYear(e.target.value)}
                                >
                                    <option value="">Year</option>
                                    {Array.from({ length: 70 }, (_, i) => 2025 - i).map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {(fieldErrors.birthMonth || fieldErrors.birthDay || fieldErrors.birthYear) && (
                                <p className="text-red-500 text-sm mt-1">
                                    {fieldErrors.birthMonth || fieldErrors.birthDay || fieldErrors.birthYear}
                                </p>
                            )}
                        </div>

                        {/* If verification has not yet been sent, show the "Next" button */}
                        {!verificationSent ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="w-full bg-white text-black font-semibold py-3 rounded-md hover:bg-gray-300 transition"
                            >
                                Next
                            </button>
                        ) : (
                            // If verification SMS has been sent, show input for verification code
                            <div className="space-y-4">
                                <div>
                                    <label className="block font-medium text-white mb-1">
                                        Enter Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        className={getInputClass("verificationCode")}
                                        placeholder="Verification Code"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                    />
                                    {fieldErrors.verificationCode && (
                                        <p className="text-red-500 text-sm mt-1">{fieldErrors.verificationCode}</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleVerify}
                                    className="w-full bg-white text-black font-semibold py-3 rounded-md hover:bg-gray-300 transition"
                                >
                                    Verify Phone
                                </button>
                            </div>
                        )}
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h1 className="text-3xl font-bold text-white">Additional Details</h1>

                        {/* LOGIN PASSWORD (Blue label) */}
                        <div>
                            <label className="block text-sm font-medium text-blue-500 mb-1">
                                Login Password
                            </label>
                            <input
                                type="password"
                                className={getInputClass("password")}
                                placeholder="******"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {fieldErrors.password && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                            )}
                        </div>

                        {/* GENDER */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Хүйс</label>
                            <select
                                className={getInputClass("gender")}
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                            >
                                <option value="">Сонгоно уу</option>
                                <option value="male">Эр</option>
                                <option value="female">Эм</option>
                                <option value="other">Бусад</option>
                            </select>
                            {fieldErrors.gender && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.gender}</p>
                            )}
                        </div>

                        {/* LOCATION */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Байршил</label>
                            <input
                                type="text"
                                className={getInputClass("location")}
                                placeholder="Байршил"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                            {fieldErrors.location && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.location}</p>
                            )}
                        </div>

                        {/* PROFILE PICTURE */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">
                                Профайл зураг
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                className={getInputClass("profilePicture")}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setProfilePicture(e.target.files[0]);
                                    }
                                }}
                            />
                            {fieldErrors.profilePicture && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.profilePicture}</p>
                            )}
                        </div>

                        {/* BUTTONS */}
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 bg-gray-300 text-black py-3 rounded-md font-semibold hover:bg-gray-500 transition"
                            >
                                Буцах
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-white text-black py-3 rounded-md font-semibold hover:bg-gray-300 transition"
                            >
                                Бүртгүүлэх
                            </button>
                        </div>
                    </form>
                )}

                <button
                    onClick={() => router.push("/")}
                    className="block text-sm text-gray-500 underline hover:text-gray-300 mt-6"
                >
                    Нүүр хуудас
                </button>
            </div>
        </div>
    );
}
