import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './EditProfile.module.css';
import Navigation from '../components/Navigation';
import { refreshToken } from '../components/refreshToken';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [errors, setErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});

    const [oldpsw, setOldpsw] = useState('');
    const [psw, setPsw] = useState('');
    const [cpsw, setCpsw] = useState('');

    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const navigate = useNavigate();

    const redirectToHome = () => {
        navigate('/');
    };


    //<------------------Test--------------------->
    useEffect(() => {
        console.log(isChangingPassword);
    });
    //<------------------Test--------------------->


    const updateUserProfile = (e) => {
        e.preventDefault();
        // Reset errors when submitting
        setErrors({});
        const token = localStorage.getItem('access');
        axios.patch('http://localhost:8000/api/profile/update', {
            first_name: firstName,
            last_name: lastName,
            email: email,
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((response) => {
                // handle success
                console.log(response);
                alert("Profile updated successfully!");
                redirectToHome();
            })
            .catch((error) => {
                // handle error
                if (error.response && error.response.status === 401) {
                    refreshToken().then(() => {
                        updateUserProfile(e);
                    });
                } else if (error.response) {
                    setErrors(error.response.data);
                } else {
                    console.log(error);
                    alert("An error occurred while updating your profile.");
                }
            });
    
    };
    

    useEffect(() => {
        const token = localStorage.getItem('access');
        axios.get('http://localhost:8000/api/profile/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then((response) => {
            setEmail(response.data.email);
            setFirstName(response.data.first_name);
            setLastName(response.data.last_name);
        })
        .catch((error) => {
            if (error.response && error.response.status === 401) {
                refreshToken().then(() => {
                    updateUserProfile();
                });
            } else {
                console.log(error);
                alert("An error occurred while fetching your profile information.");
            }
        });
    }, []);

    const handlePasswordChange = (e) => {
        e.preventDefault();
        // Reset password errors when submitting
        setPasswordErrors({});
        const token = localStorage.getItem('access');
        if (psw !== cpsw) {
            alert("New passwords don't match.");
            return;
        }
        axios.post('http://localhost:8000/api/change_password/', {
            old_password: oldpsw,
            new_password: psw,
            new_password2: cpsw
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((response) => {
                // handle success
                console.log(response);
                alert(response.data.detail);
                redirectToHome();

            })
            .catch((error) => {
                // handle error
                if (error.response && error.response.status === 401) {
                    refreshToken(() => handlePasswordChange(e));  // retry after refreshing the token
                } else if (error.response) {
                    setPasswordErrors(error.response.data);
                } else {
                    console.log(error);
                    alert("An error occurred while changing your password.");
                }
            });
    };

    return (
        <div className={styles.root}>
            <div className={styles.group_no}>
                <h2 className={styles.settings}>Edit Profile</h2>
                <a>_______________________________________</a>
            </div>
            <div className={styles.log}>
                <h3>You can edit your</h3>
                <h3>profile here!</h3>
            </div>
            <div className={styles.container}>
                <form onSubmit={updateUserProfile}>
                    <h1>Email</h1>
                    <input
                        className={styles['input[type="text"]']}
                        type="text"
                        placeholder="Email"
                        name="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    {errors.email && errors.email.map((error, index) => <p key={index} className="error">{error}</p>)}
                    <h1 className={styles.line}>_____________________________________________</h1>

                    <h1>First name</h1>
                    <input
                        className={styles['input[type="text"]']}
                        type="text"
                        placeholder="firstName"
                        name="firstName"
                        required
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                    />
                    <h1 className={styles.line}>_____________________________________________</h1>

                    <h1>Last name</h1>
                    <input
                        className={styles['input[type="text"]']}
                        type="text"
                        placeholder="lastName"
                        name="lastName"
                        required
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                    />
                    <h1 className={styles.line}>_____________________________________________</h1>

                    <button className={styles.blackbutton} type="submit">Save changes</button>
                </form>

                <button onClick={() => setIsChangingPassword(true)} className={styles.pwdbutton}  >Change Password</button>

                {isChangingPassword && (
                    <div className={styles.container}>
                        <h2>Change Password</h2>
                        <form onSubmit={handlePasswordChange}>
                            <input
                                className={styles['input[type="password"]']}
                                type="password"
                                placeholder="Old Password"
                                name="oldpsw"
                                required
                                value={oldpsw}
                                onChange={e => setOldpsw(e.target.value)}
                            />
                            {passwordErrors.old_password && passwordErrors.old_password.map((error, index) => <p key={index} className="error">{error}</p>)}
                            <h1 className={styles.line}>_____________________________________________</h1>

                            <input
                                className={styles['input[type="password"]']}
                                type="password"
                                placeholder="New Password"
                                name="psw"
                                required
                                value={psw}
                                onChange={e => setPsw(e.target.value)}
                            />
                            {passwordErrors.new_password && passwordErrors.new_password.map((error, index) => <p key={index} className="error">{error}</p>)}
                            <h1 className={styles.line}>_____________________________________________</h1>

                            <input
                                className={styles['input[type="password"]']}
                                type="password"
                                placeholder="Confirm New Password"
                                name="cpsw"
                                required
                                value={cpsw}
                                onChange={e => setCpsw(e.target.value)}
                            />
                            <h1 className={styles.line}>_____________________________________________</h1>

                            <button className={styles.blackbutton} type="submit">Save Password</button>
                            <button className={styles.pwdbutton} type="button" onClick={() => setIsChangingPassword(false)} >Cancel</button>
                        </form>
                    </div>
                )}
            </div>
            <div className='nav-box'>
                <Navigation onLocationChange={() => { }} />
            </div>
        </div>
    );

};


export default EditProfile;
