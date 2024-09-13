import { useState, useEffect, useContext } from "react"
import useAxios from "../../utils/axiosInstance"
import PropTypes from "prop-types";
import { ChatContext } from "../../pages/ChatsPage";
import { Link } from "react-router-dom";

export function ChatUsersList({userID}){
    const {fetchConversation, messages} = useContext(ChatContext)
    const axiosInstance = useAxios();
    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        axiosInstance.get(`/user/userContacts/${userID}`)
        .then(res => {
            setContacts(res.data.contacts)
            setLoading(false)
        })
        .catch(err => console.error(err))
    }, [])


    
    


    return (
        <div className="chatlist">
            <div className="modal-dialog-scrollable">
                
                <div className="modal-content">
                    <div className="chat-header">
                        <Link to="/dashboard"><i className="fa fa-arrow-left"></i> Back to dashboard</Link>
                        <div className="msg-search">
                            <input type="text" className="form-control searchChatInput" id="inlineFormInputGroup" placeholder="Search" aria-label="search" />
                            <a className="add" href="#"><img className="img-fluid" src="https://mehedihtml.com/chatbox/assets/img/add.svg" alt="add" /></a>
                        </div>

                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button className="nav-link active" id="Open-tab" data-bs-toggle="tab" data-bs-target="#Open" type="button" role="tab" aria-controls="Open" aria-selected="true">Open</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link" id="Closed-tab" data-bs-toggle="tab" data-bs-target="#Closed" type="button" role="tab" aria-controls="Closed" aria-selected="false">Closed</button>
                            </li>
                        </ul>
                    </div>

                    <div className="modal-body">
                        <div className="chat-lists">
                            <div className="tab-content" id="myTabContent">
                                <div className="tab-pane fade show active" id="Open" role="tabpanel" aria-labelledby="Open-tab">
                                    <div className="chat-list">
                                        
                                        {contacts.map(contact => {
                                            return (
                                            <a href="#" key={contact.id} className={`d-flex align-items-center receiverUser status-${contact.id}`} onClick={(e) => fetchConversation(e.currentTarget)} data-email={contact.email} data-username={contact.username} data-id={contact.id}>
                                            <div className="flex-shrink-0">
                                                <img className="img-fluid" src="https://icons.veryicon.com/png/o/miscellaneous/two-color-icon-library/user-286.png" alt="user img" />
                                                <span className="status"></span>
                                            </div>
                                            <div className="flex-grow-1 ms-3">
                                                <h3>{contact.username}</h3>
                                                <p className=''>offline</p>
                                            </div>
                                        </a>)
                                        })}


                                    </div>
                                </div>
                                <div className="tab-pane fade" id="Closed" role="tabpanel" aria-labelledby="Closed-tab">

                                    <div className="chat-list">
                                        <a href="#" className="d-flex align-items-center">
                                            <div className="flex-shrink-0">
                                                <img className="img-fluid" src="https://icons.veryicon.com/png/o/miscellaneous/two-color-icon-library/user-286.png" alt="user img" />
                                                <span className="active"></span>
                                            </div>
                                            <div className="flex-grow-1 ms-3">
                                                <h3>Mehedi Hasan</h3>
                                                <p>front end developer</p>
                                            </div>
                                        </a>
                                        

                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}



ChatUsersList.propTypes = {
    userID: PropTypes.number.isRequired,
}