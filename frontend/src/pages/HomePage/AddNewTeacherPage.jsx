import React, { useState } from "react";
import axios from "axios";
import { FaUser, FaBook, FaEnvelope, FaPhone } from "react-icons/fa";

const TeacherRegister = () => {
  const [formData, setFormData] = useState({
    TeacherID: "",
    FirstName: "",
    LastName: "",
    Subject: "",
    Email: "",
    ContactNumber: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("");  // fix 1
  const [isScanning, setIsScanning] = useState(false);       // fix 2

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/teacher_register.php", formData);
      setMessage(data.message);
      setMessageType(data.success ? "success" : "error");

      if (data.success) {
        setFormData({
          TeacherID: "",
          FirstName: "",
          LastName: "",
          Subject: "",
          Email: "",
          ContactNumber: "",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error while registering teacher.");
      setMessageType("error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          className="h-10 w-full sm:w-auto rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select</option>
          <option value="device-1">Option 1</option>
          <option value="device-2">Option 2</option>
        </select>
        <button
          type="button"
          onClick={() => setIsScanning(true)}
          className="h-10 w-full sm:w-auto rounded-md bg-blue-500 px-4 text-sm font-semibold text-white shadow hover:bg-blue-600"
        >
          Connect Reader
        </button>
        <button
          type="button"
          onClick={() => setIsScanning(false)}
          className="h-10 w-full sm:w-auto rounded-md bg-rose-400 px-4 text-sm font-semibold text-white shadow hover:bg-rose-500"
        >
         Disconnect Reader
        </button>
      </div>

      <div className="bg-gray-100">
        <div className="flex-1 overflow-auto">
          <header className="bg-white shadow-sm">
          {/*<div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">Teacher Registration</h1>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Admin</span>
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-medium">A</span>
                </div>
              </div>
            </div>*/}
          </header>

          <main className="py-6 px-0">
            <div className="px-4 py-6 sm:px-0">
              <div className="rounded-lg border border-blue-300 bg-white shadow">
                <div className="border-b border-blue-200 px-5 py-3">
                  <h2 className="text-xl font-semibold text-gray-800">Add New Teacher</h2>
                </div>

                {message && (
                  <div
                    className={`p-3 m-4 rounded-md ${
                      messageType === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <form 
                  onSubmit={handleSubmit} 
                  className="p-5"
                >
                  {/* Teacher ID - Full Width */}
                  <div className="mb-6">
                    <label htmlFor="TeacherID" className="block text-sm font-medium text-gray-700">
                      Teacher ID
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm max-w-full sm:max-w-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="TeacherID"
                        id="TeacherID"
                        value={formData.TeacherID}
                        onChange={handleChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10 border p-2"
                        placeholder="Enter teacher ID"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label htmlFor="FirstName" className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="FirstName"
                          id="FirstName"
                          value={formData.FirstName}
                          onChange={handleChange}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md h-10 border p-2"
                          placeholder="Enter first name"
                          required
                        />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="LastName" className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="LastName"
                          id="LastName"
                          value={formData.LastName}
                          onChange={handleChange}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md h-10 border p-2"
                          placeholder="Enter last name"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                    {/* Contact Number */}
                    <div>
                      <label htmlFor="ContactNumber" className="block text-sm font-medium text-gray-700">
                        Contact Number
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaPhone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="ContactNumber"
                          id="ContactNumber"
                          value={formData.ContactNumber}
                          onChange={handleChange}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10 border p-2"
                          placeholder="Enter contact number"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="Email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="Email"
                          id="Email"
                          value={formData.Email}
                          onChange={handleChange}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10 border p-2"
                          placeholder="Enter email"
                          required
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="Subject" className="block text-sm font-medium text-gray-700">
                        Teaching Subject
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaBook className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="Subject"
                          id="Subject"
                          value={formData.Subject}
                          onChange={handleChange}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10 border p-2"
                          placeholder="Enter teaching subject"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end mt-6">
                    <button
                      type="submit"
                      className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
                    >
                      Insert
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TeacherRegister;
