import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const StudentRegisterPage = () => {
	const [isScanning, setIsScanning] = useState(false);
	const [selectedDevice, setSelectedDevice] = useState('');
	const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('');

	const fileInputRef = useRef(null);
	const [photoBase64, setPhotoBase64] = useState('');

	const [formData, setFormData] = useState({
		studentId: '',
		firstName: '',
		lastName: '',
		dob: '',
		parentName: '',
		parentContactNumber: '',
		relationship: '',
		address: '',
		email: '',
		contactNumber: ''
	});

	const handleInputChange = (event) => {
		const { name, value } = event.target;
		setFormData((previous) => ({ ...previous, [name]: value }));
	};

	const handleImagePick = (event) => {
		const file = event.target.files && event.target.files[0];
		if (!file) return;
		const objectUrl = URL.createObjectURL(file);
		setPhotoPreviewUrl(objectUrl);

		const reader = new FileReader();
		reader.onloadend = () => {
			const result = reader.result;
			if (typeof result === 'string') {
				const commaIndex = result.indexOf(',');
				setPhotoBase64(commaIndex !== -1 ? result.substring(commaIndex + 1) : result);
			}
		};
		reader.readAsDataURL(file);
	};

	// Auto-dismiss messages after 2 seconds
	useEffect(() => {
		if (!message) return;
		const timerId = setTimeout(() => {
			setMessage('');
			setMessageType('');
		}, 2000);
		return () => clearTimeout(timerId);
	}, [message]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		// Frontend required field validation
		const requiredFields = [
			{ key: 'studentId', label: 'Student ID' },
			{ key: 'firstName', label: 'First Name' },
			{ key: 'lastName', label: 'Last Name' },
			{ key: 'dob', label: 'DOB' },
			{ key: 'parentName', label: 'Parent Name' },
			{ key: 'parentContactNumber', label: 'Parent Contact Number' },
			{ key: 'relationship', label: 'Relationship' },
			{ key: 'address', label: 'Address' },
			{ key: 'email', label: 'Email' },
			{ key: 'contactNumber', label: 'Contact Number' }
		];
		const missing = requiredFields
			.filter(f => !String(formData[f.key] || '').trim())
			.map(f => f.label);
		if (missing.length > 0) {
			setMessageType('error');
			setMessage(`Please fill the following: ${missing.join(', ')}`);
			return;
		}
		// DOB must be before 2020-01-01
		if (formData.dob && new Date(formData.dob) >= new Date('2020-01-01')) {
			setMessageType('error');
			setMessage('Enter a valid Date of Birth');
			return;
		}
		try {
			const payload = {
				studentID: formData.studentId,
				FirstName: formData.firstName,
				LastName: formData.lastName,
				ContactNum: formData.contactNumber,
				Email: formData.email,
				DOB: formData.dob,
				Address: formData.address,
				ParentName: formData.parentName,
				ParentTelNum: formData.parentContactNumber,
				Relationship: formData.relationship,
				Photo: photoBase64 || null
			};

			const response = await axios.post('/api/student_register.php', payload, {
				headers: { 'Content-Type': 'application/json' },
				transformResponse: [(data) => data]
			});

			let resp = response.data;
			if (typeof resp === 'string') {
				try { resp = JSON.parse(resp); } catch { resp = null; }
			}

			if (resp && resp.success) {
				setMessage(resp.message || 'Student registered successfully');
				setMessageType('success');
				setFormData({
					studentId: '',
					firstName: '',
					lastName: '',
					dob: '',
					parentName: '',
					parentContactNumber: '',
					relationship: '',
					address: '',
					email: '',
					contactNumber: ''
				});
				setPhotoPreviewUrl('');
				setPhotoBase64('');
				if (fileInputRef.current) fileInputRef.current.value = '';
			} else {
				setMessage(resp?.message || 'Registration failed');
				setMessageType('error');
			}
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error('Registration error', error);
			setMessageType('error');
			if (error.response) {
				const { status, statusText, data } = error.response;
				if (typeof data === 'string') {
					if (/duplicate entry/i.test(data)) {
						setMessage('Student ID already exists');
					} else {
						setMessage(`Server error (${status} ${statusText || ''})`.trim());
					}
				} else {
					setMessage(data?.message || 'Server error occurred');
				}
			} else {
				setMessage('A network error occurred while registering');
			}
		}
	};

	return (
		<div className="space-y-6">
			{/* Header Row */}
			<div className="flex items-center justify-end">
				 
				<div className="flex items-center space-x-3">
					<select
						value={selectedDevice}
						onChange={(e) => setSelectedDevice(e.target.value)}
						className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
					>
						<option value="">Select</option>
						<option value="device-1">Device 1</option>
						<option value="device-2">Device 2</option>
					</select>
					<button
						type="button"
						onClick={() => setIsScanning(true)}
						className="h-10 rounded-md bg-blue-500 px-4 text-sm font-semibold text-white shadow hover:bg-blue-600"
					>
						Start Scan
					</button>
					<button
						type="button"
						onClick={() => setIsScanning(false)}
						className="h-10 rounded-md bg-rose-400 px-4 text-sm font-semibold text-white shadow hover:bg-rose-500"
					>
						Stop Scan
					</button>
				</div>
			</div>


			{message && (
				<div
					className={`p-4 mb-4 text-sm rounded-lg ${
						messageType === 'success' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
					}`}
					role="alert"
				>
					{message}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Top Row: Student Details + Photo */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					{/* Student Details */}
					<div className="lg:col-span-2 rounded-lg border border-blue-300 bg-white shadow">
						<div className="border-b border-blue-200 px-5 py-3">
							<p className="text-sm font-semibold text-gray-700">Student Details</p>
						</div>
						<div className="p-5 grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<label className="mb-1 block text-sm text-gray-600">Student ID</label>
								<input
									type="text"
									name="studentId"
									value={formData.studentId}
									onChange={handleInputChange}
									className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								/>
							</div>
							<div>
								<label className="mb-1 block text-sm text-gray-600">First Name</label>
								<input
									type="text"
									name="firstName"
									value={formData.firstName}
									onChange={handleInputChange}
									className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								/>
							</div>
							<div>
								<label className="mb-1 block text-sm text-gray-600">Last Name</label>
								<input
									type="text"
									name="lastName"
									value={formData.lastName}
									onChange={handleInputChange}
									className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								/>
							</div>
							<div>
								<label className="mb-1 block text-sm text-gray-600">DOB</label>
								<input
									type="date"
									name="dob"
									value={formData.dob}
									onChange={handleInputChange}
                                    // max date is 2019-12-31
									max="2019-12-31"
									className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								/>
							</div>
						</div>
					</div>

					{/* Photo Card */}
					<div className="rounded-lg border border-blue-300 bg-white shadow">
						<div className="border-b border-blue-200 px-5 py-3">
							<p className="text-sm font-semibold text-gray-700">Parent Information</p>
						</div>
						<div className="p-5">
							<div className="flex items-center justify-center h-40 w-full rounded border border-gray-300 bg-gray-50 overflow-hidden">
								{photoPreviewUrl ? (
									<img src={photoPreviewUrl} alt="Selected" className="h-full object-contain" />
								) : (
									<span className="text-xs text-gray-400">No Image Selected</span>
								)}
							</div>
							<div className="mt-4 flex justify-center">
								<input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
								<button
									type="button"
									onClick={() => fileInputRef.current && fileInputRef.current.click()}
									className="rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600"
								>
									Select IMG
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Second Row: Parent + Contact Information */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					{/* Parent Information */}
					<div className="rounded-lg border border-blue-300 bg-white shadow">
						<div className="border-b border-blue-200 px-5 py-3">
							<p className="text-sm font-semibold text-gray-700">Parent Information</p>
						</div>
						<div className="p-5 grid grid-cols-1 gap-4">
							<div>
								<label className="mb-1 block text-sm text-gray-600">Parent Name</label>
								<input
									type="text"
									name="parentName"
									value={formData.parentName}
									onChange={handleInputChange}
									className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								/>
							</div>
							<div>
								<label className="mb-1 block text-sm text-gray-600">Parent Contact Number</label>
								<input
									type="tel"
									name="parentContactNumber"
									value={formData.parentContactNumber}
									onChange={handleInputChange}
									className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								/>
							</div>
							<div>
								<label className="mb-1 block text-sm text-gray-600">Relationship</label>
								<select
									name="relationship"
									value={formData.relationship}
									onChange={handleInputChange}
									className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								>
									<option value="">Select</option>
									<option value="Mother">Mother</option>
									<option value="Father">Father</option>
									<option value="Guardian">Guardian</option>
								</select>
							</div>
						</div>
					</div>

					{/* Contact Information */}
					<div className="lg:col-span-2 rounded-lg border border-blue-300 bg-white shadow">
						<div className="border-b border-blue-200 px-5 py-3">
							<p className="text-sm font-semibold text-gray-700">Contact Information</p>
						</div>
						<div className="p-5 grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="md:col-span-2">
								<label className="mb-1 block text-sm text-gray-600">Address</label>
								<textarea
									name="address"
									rows="3"
									value={formData.address}
									onChange={handleInputChange}
									className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								/>
							</div>
							<div>
								<label className="mb-1 block text-sm text-gray-600">Email</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								/>
							</div>
							<div>
								<label className="mb-1 block text-sm text-gray-600">Contact Number</label>
								<input
									type="tel"
									name="contactNumber"
									value={formData.contactNumber}
									onChange={handleInputChange}
									className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Footer Action */}
				<div className="flex justify-end">
					<button type="submit" className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600">
						Insert
					</button>
				</div>
			</form>
		</div>
	);
};

export default StudentRegisterPage;
