import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faQuran, faTrash, faAngleLeft, faAngleRight, faEdit, faEye } from "@fortawesome/free-solid-svg-icons";
import { Breadcrumb, Col, Row, Form, Button, InputGroup, Container, Card, Table, Modal, Nav, Tab } from '@themesberg/react-bootstrap';
import { ToastContainer, toast } from 'react-toastify/dist/react-toastify.cjs.development';
import 'react-toastify/dist/ReactToastify.css';
import {triggerFunction,getPredefinedUrl} from '../components/SignedUrl';
import { baseurl,lambda } from "../../api";

export default () => {
  const [attribbute, setAttribbute] = useState('');
  const [data, setData] = useState([]);
  const [image, setImage] = useState(null);
  const [heading, setHeading] = useState('');
  const [content, setContent] = useState('');
  const [service_name, setService_name] = useState('');
  const [benfits_heading, setBenfits_heading] = useState('');
  const [benfits_content, setBenfits_content] = useState('');
  const [isActive, setIsActive] = useState('false');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [showModal, setShowModal] = useState(false);
  const [clickedImage, setClickedImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [clickedItem, setClickedItem] = useState(null);

  const [editHeading, setEditHeading] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editService_Name, setEditService_name] = useState('');
  const [editBenfits_Heading, setEditBenfits_heading] = useState('');
  const [editBenfits_Content, setEditBenfits_content] = useState('');
  const [editIsActive, setEditIsActive] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileExtension, setFileExtension] = useState('');
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [key,setKey]=useState("");
  const [folderName, setFolderName] = useState(''); // State for folder name
  const [folders, setFolders] = useState([]); // State for storing folder names
  const [url, setUrl] = useState('');


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Read file extension
      const fileExtension = file.name.split('.').pop();
      setSelectedFile(file);
      setFileExtension(fileExtension);
      let arr1=triggerFunction(fileExtension, folderName)
      console.log(arr1)
      setUrl(arr1[0]); // Update URL with folderName
      setKey(arr1[1])
      setIsFileSelected(true); // Enable upload button
    } else {
      setSelectedFile(null);
      setFileExtension('');
      setIsFileSelected(false); // Disable upload button
    }
  };
 
  const handleUpload = () => {
    if (!selectedFile) return;
  
   
  
    const token = localStorage.getItem('token');
  
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContent = event.target.result;
      // Perform your upload logic here
      // For demonstration, let's just log the file extension and content
      console.log('Selected File Extension:', fileExtension);
      console.log('File Content:', fileContent);
  
      try {
        // Example: Uploading file content using Fetch
        const responseFile = await fetch(url, {
          method: 'PUT',
          body: fileContent,
          headers: {
            'Content-Type': 'application/octet-stream', // Set appropriate content type
          },
          mode: 'cors', // Enable CORS
        });
        if (!responseFile.ok) {
          throw new Error('Network response was not ok');
        }
        console.log('File uploaded successfully:', responseFile);
        console.log(getPredefinedUrl(key))
        console.log(baseurl)
      
        
        const body={
           image:getPredefinedUrl(key),
           heading,
           content,
           service_name,
           benfits_heading,
           benfits_content,
           isActive
        }
        console.log(body)
        // Example: Posting additional form data using Axios
        const responseFormData = await axios.post(`${baseurl}/api/post/work`, body, {
          headers: {
            Authorization: `${token}`,
             // Set appropriate content type
          },
        });
        console.log(responseFormData,"hi");
        toast.success('Image added successfully'); // Call toast.success after successful addition
    // Reload page after successful submission
         window.location.reload();
 
    // Clear form data after submission
    setImage(null);
    setHeading('');
    setContent('');
    setService_name('');
    setBenfits_heading('');
    setBenfits_content('');
    setIsActive(false);
         
           
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to add image'); // Display error toast if addition fails
      }
    };
  
    reader.readAsArrayBuffer(selectedFile);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  useEffect(() => {
    axios.get(`${baseurl}/api/get/work?page=${currentPage}&perPage=${itemsPerPage}`)
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
      });
  }, [currentPage, itemsPerPage]);

  const handleDelete = (id) => {
    const token = localStorage.getItem('token');
    axios.delete(`${baseurl}/api/delete/work/${id}`, {
      headers: {
        Authorization: `${token}`
      }
    })
      .then(response => {
        setData(prevData => prevData.filter(item => item.id !== id));
        toast.success('Record deleted successfully');
        window.location.reload();
      })
      .catch(error => {
        toast.error('Failed to delete record');
      });
  }

  const handleCloseModal = () => {
    setShowModal(false);
  }

  const handleImageClick = (imageUrl) => {
    setClickedImage(imageUrl);
    setShowModal(true);
  }

  const handleEditModal = (row) => {
    setEditItemId(row._id);
    setEditHeading(row.heading);
    setEditContent(row.content);
    setEditBenfits_content(row.benfits_content);
    setEditBenfits_heading(row.benfits_heading);
    setEditService_name(row.service_name);
    setEditIsActive(row.isActive);
    setShowModal(true);
    setEditMode(true);
  }

  const handleEditSubmit = async () => {
    const token = localStorage.getItem('token');
    const editData = {
      heading: editHeading,
      content: editContent,
      service_name: editService_Name,
      benfits_heading: editBenfits_Heading,
      benfits_content: editBenfits_Content,
      isActive: editIsActive
    };

    try {
      const response = await axios.put(`${baseurl}/api/update/work/${editItemId}`, editData, {
        headers: {
          Authorization: `${token}`
        }
      });
      toast.success('Data updated successfully');
      setShowModal(false);
      setData(prevData => prevData.map(item => item._id === editItemId ? { ...item, ...editData } : item));
    } catch (error) {
      toast.error('Failed to update record');
    }
  }

  const clearFormData = () => {
    setHeading('');
    setImage(null);
    setContent('');
    setBenfits_content('');
    setBenfits_heading('');
    setService_name('');
    setIsActive(false);
  }

  const handleViewDetails = (row) => {
    setClickedItem(row);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setClickedItem(null);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <>
      <div className="d-xl-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-2">
        <div className="d-block mb-4 mb-xl-0">
          <Breadcrumb className="d-none d-md-inline-block" listProps={{ className: "breadcrumb-dark breadcrumb-transparent" }}>
            <Breadcrumb.Item><FontAwesomeIcon icon={faHome} /></Breadcrumb.Item>
            <Breadcrumb.Item>Services</Breadcrumb.Item>
            <Breadcrumb.Item active>Services</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      <Tab.Container defaultActiveKey="home">
        <Nav fill variant="pills" className="flex-column flex-sm-row">
          <Nav.Item>
            <Nav.Link eventKey="home" className="mb-sm-3 mb-md-0">
              Form
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="profile" className="mb-sm-3 mb-md-0">
              Table
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="home" className="py-4">
            <section className="d-flex align-items-center my-2 mt-lg-3 mb-lg-5">
              <Container>
                <Row>
                  <Col xs={12} lg={12} className="mb-4 mb-lg-0">
                    <div className="bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100">
                      <div className="text-center text-md-center mb-4 mt-md-0">
                        <h3 className="mb-0">Services</h3>
                      </div>
                      <Form className="mt-4" onSubmit={handleUpload}>
                        <Row>
                          <Col xs={12} md={6}>
                            <Form.Group id="serviceDescription" className="mb-4">
                              <Form.Label>Heading</Form.Label>
                              <InputGroup>
                                <InputGroup.Text>
                                </InputGroup.Text>
                                <Form.Control autoFocus required type="text" placeholder="Heading" value={heading} onChange={(e) => setHeading(e.target.value)} />
                              </InputGroup>
                            </Form.Group>
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Group id="serviceDescription" className="mb-4">
                              <Form.Label>Content</Form.Label>
                              <InputGroup>
                                <InputGroup.Text>
                                </InputGroup.Text>
                                <Form.Control as="textarea" placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
                              </InputGroup>
                            </Form.Group>
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Group id="serviceImage" className="mb-4">
                              <Form.Label>Image</Form.Label>
                              <InputGroup>
                                <InputGroup.Text>
                                </InputGroup.Text>
                                <Form.Control
                                  type="file"
                                  accept="images/*"
                                  onChange={handleFileChange}
                                  placeholder="Upload Image"
                                />
                              </InputGroup>
                            </Form.Group>
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Group id="serviceDescription" className="mb-4">
                              <Form.Label>Service_name</Form.Label>
                              <InputGroup>
                                <InputGroup.Text>
                                </InputGroup.Text>
                                <Form.Control autoFocus required type="text" placeholder="service_name" value={service_name} onChange={(e) => setService_name(e.target.value)} />
                              </InputGroup>
                            </Form.Group>
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Group id="serviceDescription" className="mb-4">
                              <Form.Label>Benfits_heading</Form.Label>
                              <InputGroup>
                                <InputGroup.Text>
                                </InputGroup.Text>
                                <Form.Control autoFocus required type="text" placeholder="benfits_heading" value={benfits_heading} onChange={(e) => setBenfits_heading(e.target.value)} />
                              </InputGroup>
                            </Form.Group>
                          </Col>
                          <Col xs={12} md={6}>
                            <Form.Group id="serviceDescription" className="mb-4">
                              <Form.Label>Benfits_content</Form.Label>
                              <InputGroup>
                                <InputGroup.Text>
                                </InputGroup.Text>
                                <Form.Control as="textarea" placeholder="benfits_content" value={benfits_content} onChange={(e) => setBenfits_content(e.target.value)} />
                              </InputGroup>
                            </Form.Group>
                          </Col>
                          <Col >
                            <Form.Group id="isActive" className="mb-4">
                              <Form.Label>Is Active</Form.Label>
                              <InputGroup>
                                <InputGroup.Text>
                                </InputGroup.Text>
                                <Form.Select required value={isActive} onChange={(e) => setIsActive(e.target.value)}>
                                  <option value="">Select Option</option>
                                  <option value="true">True</option>
                                  <option value="false">False</option>
                                </Form.Select>
                              </InputGroup>
                            </Form.Group>
                          </Col>
                        </Row>
                        <Button variant="primary" type="submit" className="w-100 mt-3">
                          Submit
                        </Button>
                      </Form>
                    </div>
                  </Col>
                </Row>
              </Container>
            </section>
          </Tab.Pane>
          <Tab.Pane eventKey="profile" className="py-4">
          <section>
            <Container>
              <Row>
                <Col xs={12} lg={12}>
                  <Card border="light" className="shadow-sm">
                    <Card.Header>
                      <Row className="align-items-center">
                        <Col>
                          <h5>Services</h5>
                        </Col>
                      </Row>
                    </Card.Header>
                    <Table responsive className="align-items-center table-flush">
                      <thead className="thead-dark">
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">Heading</th>
                          <th scope="col">Image</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((row, index) => (
                          <tr key={index}>
                            <td>{indexOfFirstItem + index + 1}</td>
                            <td>{row.heading}</td>
                            {/* <td>
                              <ul>
                                {row.content.split('. ').map((point, index) => (
                                  <li key={index}>{point}</li>
                                ))}
                              </ul>
                            </td> */}
                            <td>
                              {row.image && (
                                <img
                                  src={row.image}
                                  alt="Image"
                                  style={{ maxWidth: "100px", cursor: "pointer" }}
                                  onClick={() => handleImageClick(row.image)}
                                />
                              )}
                            </td>
                            {/* <td>{row.service_name}</td>
                            <td>{row.benfits_heading}</td> */}
                            {/* <td>
                              <ul>
                                {row.benfits_content.split(/\.\s+/).map((point, index) => (
                                  <li key={index}>{point}</li>
                                ))}
                              </ul>
                            </td> */}
                            {/* <td>{row.isActive ? "True" : "False"}</td> */}
                            <td>
                                <Button variant="info" size="sm" onClick={() => handleViewDetails(row)}>
                                  <FontAwesomeIcon icon={faEye} />
                                  view
                                </Button>
                                <br/>
                                <br/>
                                <Button variant="info" size="sm" onClick={() => handleEditModal(row)}>
                                  <FontAwesomeIcon icon={faEdit} />
                                  Edit
                                </Button>
                                <br/>
                                <br/>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(row._id)}>
                                  <FontAwesomeIcon icon={faTrash} />
                                  Delete
                                </Button>
                              </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="8">
                            <div className="d-flex justify-content-center mt-3">
                              <Button
                                variant="light"
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="me-2"
                              >
                                <FontAwesomeIcon icon={faAngleLeft} />
                              </Button>
                              <Button
                                variant="light"
                                disabled={currentItems.length < itemsPerPage}
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="ms-2"
                              >
                                <FontAwesomeIcon icon={faAngleRight} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
                    <Modal show={showModal && editMode} onHide={() => setEditMode(false)}>
                      <Modal.Header>
                        <Modal.Title>Edit Blog</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <Form>
                          <Form.Group className="mb-3" controlId="editHeading">
                            <Form.Label>Heading</Form.Label>
                            <Form.Control type="text" value={editHeading} onChange={(e) => setEditHeading(e.target.value)} />
                          </Form.Group>
                          <Form.Group className="mb-3" controlId="editContent">
                            <Form.Label>Content</Form.Label>
                            <Form.Control as="textarea" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                          </Form.Group>
                          <Form.Group className="mb-3" controlId="editServiceName">
                            <Form.Label>Service Name</Form.Label>
                            <Form.Control type="text" value={editService_Name} onChange={(e) => setEditService_name(e.target.value)} />
                          </Form.Group>
                          <Form.Group className="mb-3" controlId="editBenefitsHeading">
                            <Form.Label>Benefits Heading</Form.Label>
                            <Form.Control type="text" value={editBenfits_Heading} onChange={(e) => setEditBenfits_heading(e.target.value)} />
                          </Form.Group>
                          <Form.Group className="mb-3" controlId="editBenefitsContent">
                            <Form.Label>Benefits Content</Form.Label>
                            <Form.Control as="textarea" value={editBenfits_Content} onChange={(e) => setEditBenfits_content(e.target.value)} />
                          </Form.Group>
                          <Form.Group className="mb-3" controlId="editIsActive">
                            <Form.Check type="checkbox" label="Is Active" checked={editIsActive} onChange={(e) => setEditIsActive(e.target.checked)} />
                          </Form.Group>
                        </Form>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={() => setEditMode(false)}>
                          Cancel
                        </Button>
                        <Button variant="primary" onClick={handleEditSubmit}>
                          Save Changes
                        </Button>
                      </Modal.Footer>
                    </Modal>

                  </Card>
                </Col>
              </Row>
            </Container>
            <Modal show={showDetailsModal} onHide={handleCloseDetailsModal}>
                <Modal.Header>
                  <Modal.Title>Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {clickedItem && (
                    <>
                      <p><strong>Heading:</strong> {clickedItem.heading}</p>
                      <p><strong>Service_name:</strong> {clickedItem.service_name}</p>
                      <p><strong>Content:</strong> {clickedItem.content}</p>
                      <p><strong>Benfits_heading:</strong> {clickedItem.benfits_heading}</p>
                      <p><strong>Benfits_content:</strong> {clickedItem.benfits_content}</p>
                      <p><strong>Active:</strong> {clickedItem.isActive ? "Yes" : "No"}</p>
                    </>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseDetailsModal}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
          </section>
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container >
      <Modal show={showModal && !editMode} onHide={handleCloseModal}>
        <Modal.Header>
          <Modal.Title>{data.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img src={clickedImage} alt="Zoomed Image" style={{ maxWidth: "100%" }} onClick={() => setEditMode(true)} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

