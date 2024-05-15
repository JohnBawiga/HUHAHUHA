import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminTeachers.css';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUserXmark } from '@fortawesome/free-solid-svg-icons';

function AdminTeachers() {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalOpen2, setModalOpen2] = useState(false); // New state variable for section modal
    const [modalMessage, setModalMessage] = useState("");
   
    const [modalError, setModalError]= useState(false);
    const [students, setStudents] = useState([]);
    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState(null);
    const [sectionName, setSectionName] = useState('');
    const [teachersForSection, setTeachersForSection] = useState([]);
    const { adminID } = useParams();

    useEffect(() => {
        axios.get('http://localhost:8080/getallteachers')
            .then(response => {
                setTeachers(response.data);
            })
            .catch(error => {
                console.error('Error fetching teachers:', error);
            });
    }, []);

    useEffect(() => {
        axios.get('http://localhost:8080/getAllSections')
            .then(response => {
                setSections(response.data);
            })
            .catch(error => {
                console.error('Error fetching sections:', error);
            });
    }, []);

    const deleteTeacher = (userid) => {
        axios.delete(`http://localhost:8080/deleteteacher/${userid}`)
            .then(response => {
                setTeachers(teachers.filter(teacher => teacher.userid !== userid));
            })
            .catch(error => {
                if (error.response && error.response.status === 500) {
                    setModalMessage("Student is assigned to the teacher. Teacher cannot be deleted.");
                    setModalError(true);
                } else {
                    console.error('Error deleting teacher:', error);
                }
            });
    };

    const handleTeacherClick = (teacher) => {
        setSelectedTeacher(teacher);
        setSelectedSection(null); // Reset selected section
        setModalOpen(true);
    };

    const handleSectionClick = (sectionId) => {
        axios.get(`http://localhost:8080/getbySectionid/${sectionId}`)
            .then(response => {
                setSectionName(response.data.sectionName);
            })
            .catch(error => {
                console.error('Error fetching section name:', error);
            });

        // Fetch students associated with the selected section
        axios.get(`http://localhost:8080/sections/${sectionId}`)
            .then(response => {
                setStudents(response.data);
                setSelectedSection(sectionId);
                setModalOpen2(true); // Open section modal
                axios.get(`http://localhost:8080/teachersections/${sectionId}`)
                    .then(teacherResponse => {
                        setTeachersForSection(teacherResponse.data);
                    })
                    .catch(error => {
                        console.error('Error fetching teachers for section:', error);
                    });
            })
            .catch(error => {
                setModalMessage("There are no students for this section.");
                setModalError(true);
            });
    };
    const closeModal = () => {
        setModalError(false);
        setModalMessage('');
    };
    return (
        <div className="container">
        <div className="container">
            <div className="header">
                <h1>List of Teachers</h1>
                <Link to={`/Admin/AddTeacher/${adminID}`}>
                    <FontAwesomeIcon icon={faPlus} />
                </Link>
            </div>
            <ul>
                {teachers.map(teacher => (
                    <li key={teacher.userid} onClick={() => handleTeacherClick(teacher)}>
                        {teacher.firstName} {teacher.lastName} - ID: {teacher.teacherID} 
                        <button 
    onClick={(e) => { e.stopPropagation(); deleteTeacher(teacher.userid) }}
    style={{ background: 'transparent', border: 'none', padding: '0 5px'}} // Add this inline style
>
    <FontAwesomeIcon icon={faUserXmark} style={{ color: '#690202' }}/>
</button>
                    </li>
                ))}
            </ul>

            {modalOpen && selectedTeacher && (
                <div className="modalSECTION">
                    <div className="modal-content">
                        <span className="close" onClick={() => setModalOpen(false)}>&times;</span>
                        <h2>Teacher Details</h2>
                        <div className="image">
                            <div className="circle-1"></div>
                            <div className="circle-2"></div>
                            <img src={`data:image/png;base64,${selectedTeacher.profile}`} alt={selectedTeacher.firstName} />
                        </div>
                        <p>Teacher ID: {selectedTeacher.teacherID}</p>
                        <p>Email: {selectedTeacher.email} </p>
                        <p>Assigned Year: {selectedTeacher.assignedYear}</p>
                    </div>
                </div>
            )}

            {modalOpen2 && selectedSection && (
                <div className="modalSECTION">
                    <div className="modal-content">
                        <span className="close" onClick={() => setModalOpen2(false)}>&times;</span>
                        <h2>Section: {sectionName}</h2>
                        <h3>Teacher:</h3>
                        <ul>
                            {teachersForSection.map(item => (
                                <li key={item.teacher.userid}>
                                    {item.teacher.firstName} {item.teacher.lastName} (ID: {item.teacher.teacherID})
                                </li>
                            ))}
                        </ul>
                        <h3>Students:</h3>
                        <ul>
                            {students.map(student => (
                                <li key={student.student.userid}>
                                    {student.student.firstName} {student.student.lastName} (ID: {student.student.studentID})
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
 {modalError && (
                <div className="modalError">
                    <div className="modal-content-error">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h3>{modalMessage}</h3>
                    </div>
                </div>
            )}
           
        </div>
        <div className="container">
                <div className="header">
                    <h1>List of Sections</h1>
                    <Link to={`/Admin/AddSection/${adminID}`}>
                        <FontAwesomeIcon icon={faPlus} />
                    </Link>
                </div>
                <ul>
                    {sections.map(section => (
                        <li key={section.id} onClick={() => handleSectionClick(section.id)}>
                            {section.sectionName}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default AdminTeachers;
