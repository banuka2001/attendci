import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentEnrollPage = () => {
	const [isScanning, setIsScanning] = useState(false);
	const [selectedDevice, setSelectedDevice] = useState('');
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('');
	const [classes, setClasses] = useState([]);
	const [loading, setLoading] = useState(false);

	const [formData, setFormData] = useState({
		studentId: '',
		classId: ''
	});

	// Searchable dropdown states
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredClasses, setFilteredClasses] = useState([]);

	const handleInputChange = (event) => {
		const { name, value } = event.target;
		setFormData((previous) => ({ ...previous, [name]: value }));
	};

	// Handle class ID search input
	const handleClassIdSearch = (event) => {
		const value = event.target.value;
		setSearchTerm(value);
		setFormData((previous) => ({ ...previous, classId: value }));
		setIsDropdownOpen(true);
	};

	// Handle class selection from dropdown
	const handleClassSelect = (classItem) => {
		setFormData((previous) => ({ ...previous, classId: classItem.ClassID }));
		setSearchTerm(`${classItem.ClassID} - ${classItem.ClassName}`);
		setIsDropdownOpen(false);
	};

	// Handle dropdown toggle
	const toggleDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen);
		if (!isDropdownOpen) {
			setSearchTerm(formData.classId);
		}
	};

	// Handle click outside to close dropdown
	const handleClickOutside = (event) => {
		if (!event.target.closest('.dropdown-container')) {
			setIsDropdownOpen(false);
		}
	};

	// Function to fetch classes from API
	const fetchClasses = async () => {
		setLoading(true);
		try {
			const { data } = await axios.get('/api/get_classes.php');
			if (data.success) {
				setClasses(data.data || []);
			} else {
				setClasses([]);
			}
		} catch (error) {
			console.error('Error fetching classes:', error);
			setClasses([]);
		} finally {
			setLoading(false);
		}
	};

	// Auto-dismiss messages after 3 seconds
	useEffect(() => {
		if (!message) return;
		const timerId = setTimeout(() => {
			setMessage('');
			setMessageType('');
		}, 3000);
		return () => clearTimeout(timerId);
	}, [message]);

	// Load classes on component mount
	useEffect(() => {
		fetchClasses();
	}, []);

	// Filter classes based on search term
	useEffect(() => {
		if (!searchTerm.trim()) {
			setFilteredClasses(classes);
		} else {
			const filtered = classes.filter(classItem => 
				classItem.ClassID.toLowerCase().includes(searchTerm.toLowerCase()) ||
				classItem.ClassName.toLowerCase().includes(searchTerm.toLowerCase())
			);
			setFilteredClasses(filtered);
		}
	}, [classes, searchTerm]);

	// Handle click outside to close dropdown
	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleSubmit = async (event) => {
		event.preventDefault();
		
		// Frontend required field validation
		const requiredFields = [
			{ key: 'studentId', label: 'Student ID' },
			{ key: 'classId', label: 'Class ID' }
		];
		
		const missing = requiredFields
			.filter(f => !String(formData[f.key] || '').trim())
			.map(f => f.label);
			
		if (missing.length > 0) {
			setMessageType('error');
			setMessage(`Please fill the following: ${missing.join(', ')}`);
			return;
		}

		// Submit to backend API
		try {
			const { data } = await axios.post('/api/student_enroll.php', {
				studentID: formData.studentId,
				classID: formData.classId
			});

			if (data.success) {
				setMessageType('success');
				setMessage(data.message || 'Student enrolled successfully');
				
				// Reset form
				setFormData({
					studentId: '',
					classId: ''
				});
				setSearchTerm('');
				setIsDropdownOpen(false);
			} else {
				setMessageType('error');
				setMessage(data.message || 'Failed to enroll student');
			}
		} catch (error) {
			setMessageType('error');
			console.error('Enrollment error:', error);
			
			if (error.response) {
				// Server responded with error status (4xx, 5xx)
				const { data } = error.response;
				if (data && data.message) {
					setMessage(data.message);
				} else {
					setMessage('Server error occurred. Please try again.');
				}
			} else if (error.request) {
				// Network error - no response received
				setMessage('Network error. Please check your connection and try again.');
			} else {
				// Other error
				setMessage('An unexpected error occurred. Please try again.');
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
				{/* Enrollment Form Card */}
				<div className="rounded-lg border border-blue-300 bg-white shadow">
					<div className="border-b border-blue-200 px-5 py-3">
						<p className="text-sm font-semibold text-gray-700">Add student into class</p>
					</div>
					<div className="p-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
						{/* Student ID Field */}
						<div>
							<label className="mb-1 block text-sm text-gray-600">Student ID</label>
							<input
								type="text"
								name="studentId"
								value={formData.studentId}
								onChange={handleInputChange}
								className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder="Enter or scan Student ID here"
							/>
							<p className="mt-1 text-xs text-rose-500">Enter or scan Student ID here *</p>
						</div>

						{/* Class ID Field - Searchable Dropdown */}
						<div className="dropdown-container relative">
							<label className="mb-1 block text-sm text-gray-600">Class ID</label>
							<div className="relative">
								<input
									type="text"
									value={searchTerm}
									onChange={handleClassIdSearch}
									onFocus={() => setIsDropdownOpen(true)}
									className="w-full rounded border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
									placeholder="Type or select class..."
								/>
								<button
									type="button"
									onClick={toggleDropdown}
									className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									<svg
										className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
									</svg>
								</button>
							</div>
							
							{/* Dropdown Options */}
							{isDropdownOpen && (
								<div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
									{loading ? (
										<div className="px-3 py-2 text-sm text-gray-500">Loading classes...</div>
									) : filteredClasses.length > 0 ? (
										filteredClasses.map((classItem) => (
											<button
												key={classItem.ClassID}
												type="button"
												onClick={() => handleClassSelect(classItem)}
												className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
											>
												<div className="font-medium text-gray-900">{classItem.ClassID}</div>
												<div className="text-xs text-gray-500">{classItem.ClassName}</div>
											</button>
										))
									) : (
										<div className="px-3 py-2 text-sm text-gray-500">No classes found</div>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Footer Action */}
					<div className="flex justify-end p-5 pt-0">
						<button 
							type="submit" 
							className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
						>
							Insert
						</button>
					</div>

					{/* Instructional Text */}
					<div className="px-5 pb-5">
						<p className="text-center text-sm text-gray-500">
							When you are going to enroll student to new class, before make sure student registered into the system
						</p>
					</div>
				</div>
			</form>
		</div>
	);
};

export default StudentEnrollPage;
