import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ClassRegister = () => {
	const [isConnected, setIsConnected] = useState(false);
	const [selectedDevice, setSelectedDevice] = useState('');
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('');
	const [showClasses, setShowClasses] = useState(false);
	const [classes, setClasses] = useState([]);
	const [loading, setLoading] = useState(false);

	const [formData, setFormData] = useState({
		classId: '',
		teacherId: '',
		className: '',
		subject: '',
		batch: '',
		classPrice: ''
	});

	const handleInputChange = (event) => {
		const { name, value } = event.target;
		setFormData((previous) => ({ ...previous, [name]: value }));
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

	// Function to toggle classes visibility
	const toggleShowClasses = () => {
		if (!showClasses) {
			fetchClasses();
		}
		setShowClasses(!showClasses);
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

	// Load classes on component mount for large screens
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 1024) { // lg breakpoint
				fetchClasses();
			}
		};
		
		// Check on mount
		handleResize();
		
		// Listen for resize events
		window.addEventListener('resize', handleResize);
		
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const handleSubmit = async (event) => {
		event.preventDefault();
		// Frontend required field validation
		const required = [
			{ key: 'classId', label: 'Class ID' },
			{ key: 'teacherId', label: 'Teacher ID' },
			{ key: 'className', label: 'Class Name' },
			{ key: 'subject', label: 'Subject' },
			{ key: 'batch', label: 'Batch' },
			{ key: 'classPrice', label: 'Class Price' }
		];
		const missing = required
			.filter((f) => !String(formData[f.key] || '').trim())
			.map((f) => f.label);
		if (missing.length > 0) {
			setMessageType('error');
			setMessage(`Please fill the following: ${missing.join(', ')}`);
			return;
		}

		// Basic format checks
		const priceNumber = Number(formData.classPrice);
		if (Number.isNaN(priceNumber) || priceNumber < 0) {
			setMessageType('error');
			setMessage('Enter a valid Class Price');
			return;
		}

		// Submit to backend API
		try {
			const { data } = await axios.post('/api/class_register.php', {
				ClassID: formData.classId,
				ClassName: formData.className,
				ClassSubject: formData.subject,
				ClassBatch: formData.batch,
				ClassPrice: formData.classPrice,
				TeacherID: formData.teacherId
			});

			if (data.success) {
				setMessageType('success');
				setMessage(data.message || 'Class registered successfully');
				setFormData({
					classId: '',
					teacherId: '',
					className: '',
					subject: '',
					batch: '',
					classPrice: ''
				});
				// Refresh classes list if it's currently visible
				if (showClasses) {
					fetchClasses();
				}
			} else {
				setMessageType('error');
				setMessage(data.message || 'Failed to register class');
			}
		} catch (error) {
			setMessageType('error');
			console.error('Registration error:', error);
			
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
						onClick={() => setIsConnected(true)}
						className="h-10 rounded-md bg-blue-500 px-4 text-sm font-semibold text-white shadow hover:bg-blue-600"
					>
						Connect Reader
					</button>
					<button
						type="button"
						onClick={() => setIsConnected(false)}
						className="h-10 rounded-md bg-rose-400 px-4 text-sm font-semibold text-white shadow hover:bg-rose-500"
					>
						Disconnect Reader
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
				{/* Classes Card */}
				<div className="rounded-lg border border-blue-300 bg-white shadow">
					<div className="border-b border-blue-200 px-5 py-3">
						<p className="text-sm font-semibold text-gray-700">Create New Classes</p>
					</div>
					<div className="p-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
						{/* Left column */}
						<div className="grid grid-cols-1 gap-4">
							<div>
								<label className="mb-1 block text-sm text-gray-600">Class ID</label>
								<input
									type="text"
									name="classId"
									placeholder="Ex: 2025MATHS-TeacherName"
									value={formData.classId}
									onChange={handleInputChange}
									className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								/>
								<p className="mt-1 text-xs text-rose-500">Make sure Class ID should be unique</p>
							</div>

							<div>
								<label className="mb-1 block text-sm text-gray-600">Class Name</label>
								<input
									type="text"
									name="className"
									placeholder="Physics 2025 A/L"
									value={formData.className}
									onChange={handleInputChange}
									className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								/>
							</div>

							<div>
								<label className="mb-1 block text-sm text-gray-600">Class Price</label>
								<input
									type="number"
									name="classPrice"
									placeholder="0000.00"
									step="0.01"
									min="0"
									value={formData.classPrice}
									onChange={handleInputChange}
									className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								/>
							</div>
						</div>

						{/* Right column */}
						<div className="grid grid-cols-1 gap-4">
							<div>
								<label className="mb-1 block text-sm text-gray-600">Teacher ID</label>
								<input
									type="text"
									name="teacherId"
									placeholder="Enter or scan Teacher ID here"
									value={formData.teacherId}
									onChange={handleInputChange}
									className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								/>
								<p className="mt-1 text-xs text-rose-500">Enter or scan Teacher ID here *</p>
							</div>

							<div>
								<label className="mb-1 block text-sm text-gray-600">Subject</label>
								<input
									type="text"
									name="subject"
									placeholder="Physics"
									value={formData.subject}
									onChange={handleInputChange}
									className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								/>
							</div>

							<div>
								<label className="mb-1 block text-sm text-gray-600">Batch</label>
								<input
									type="text"
									name="batch"
									placeholder="Term1 - 2025 A/L"
									value={formData.batch}
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

			{/* Classes Table - Always visible on large screens, toggleable on small screens */}
			<div className={`${showClasses ? 'block' : 'hidden'} lg:block`}>
				<div className="rounded-lg border border-blue-300 bg-white shadow">
					<div className="border-b border-blue-200 px-5 py-3">
						<p className="text-sm font-semibold text-gray-700">All Classes</p>
					</div>
					
					<div className="overflow-x-auto">
						{loading ? (
							<div className="p-8 text-center">
								<p className="text-gray-500">Loading classes...</p>
							</div>
						) : classes.length > 0 ? (
							<table className="w-full">
								<thead>
									<tr className="bg-blue-600 text-white">
										<th className="px-4 py-3 text-left text-sm font-semibold">ClassID</th>
										<th className="px-4 py-3 text-left text-sm font-semibold">ClassName</th>
										<th className="px-4 py-3 text-left text-sm font-semibold">Class Subject</th>
										<th className="px-4 py-3 text-left text-sm font-semibold">Class Batch</th>
										<th className="px-4 py-3 text-left text-sm font-semibold">Class Price</th>
										<th className="px-4 py-3 text-left text-sm font-semibold">Teacher Name</th>
									</tr>
								</thead>
								<tbody>
									{classes.map((classItem, index) => (
										<tr key={classItem.ClassID} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
											<td className="px-4 py-3 text-sm text-gray-900">{classItem.ClassID}</td>
											<td className="px-4 py-3 text-sm text-gray-900">{classItem.ClassName}</td>
											<td className="px-4 py-3 text-sm text-gray-900">{classItem.ClassSubject}</td>
											<td className="px-4 py-3 text-sm text-gray-900">{classItem.ClassBatch}</td>
											<td className="px-4 py-3 text-sm text-gray-900">${parseFloat(classItem.ClassPrice).toFixed(2)}</td>
											<td className="px-4 py-3 text-sm text-gray-900">{classItem.TeacherName || 'N/A'}</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<div className="p-8 text-center">
								<p className="text-gray-500">No classes found. Register a class to see it here.</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Status line for reader connection */}
			<p className="text-xs text-gray-500">Reader: {isConnected ? 'Connected' : 'Disconnected'}</p>
			
			{/* Show all classes button - only visible on small screens, positioned at bottom left */}
			<div className="block lg:hidden">
				<button
					type="button"
					onClick={toggleShowClasses}
					className="h-10 rounded-md bg-green-500 px-4 text-sm font-semibold text-white shadow hover:bg-green-600"
				>
					{showClasses ? 'Hide Classes' : 'Show All Classes'}
				</button>
			</div>
		</div>
	);
};

export default ClassRegister;
