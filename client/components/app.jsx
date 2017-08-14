"use strict"

import axios from "axios";
import React from "react";

import {
  Button,
  FormControl,
  InputGroup,
  Navbar,
  Nav,
  NavDropdown,
  NavItem,
  MenuItem,
  Modal
} from "react-bootstrap";

import "./app.css";

import Venue from "./venue.jsx";

import modals from "./modals.jsx"; // ◄- object with content and handlers for modal.
// {header, body, footer} are func that return jsx for same name parts of modal.

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      bodyMessage: "",
      modal: modals.login,
      position: null,
      selectedVenues: JSON.parse(sessionStorage.getItem("selectedVenues")) || [],
      searchInput: "",
      searchInputPlaceholder: "please enter your location",
      showModal: false,
      venues: JSON.parse(sessionStorage.getItem("venues")) || [],
    };
  }

  renderNav = () => { // ◄- nav content depends on the availability of the token

    let _renderNav = () => {

          if (sessionStorage.getItem("token")) { // ◄--------------- user's menu
            return (
                <Nav pullRight={true}>
                  <NavDropdown eventKey="1"
                               id="dropdown"
                               title={sessionStorage.getItem("name")}>
                    <MenuItem eventKey="1.1"
                              onClick={() =>
                                  this.setState({
                                    showModal: true,
                                    modal: modals.selectedVenues
                                  })}>
                      selected venues
                    </MenuItem>
                    <MenuItem eventKey="1.2"
                              onClick={() =>
                                  this.setState({
                                    showModal: true,
                                    modal: modals.logout
                                  })}>
                      logout
                    </MenuItem>
                  </NavDropdown>
                </Nav>
            );

          } else { // ◄--------------------------- nav for unauthenticated users
            return (
                <Nav pullRight={true}>
                  <NavItem eventKey={1}
                           onClick={() =>
                               this.setState({
                                 showModal: true,
                                 modal: modals.signup
                               })}>
                    signup
                  </NavItem>
                  <NavItem eventKey={2}
                           onClick={() =>
                               this.setState({
                                 showModal: true,
                                 modal: modals.login
                               })}>
                    login
                  </NavItem>
                </Nav>
            )
          }
        };

    return (
        <Navbar id="nav">
          <Navbar.Header>
            {this.renderSearchForm()}
          </Navbar.Header>
          {_renderNav()}
        </Navbar>
    )
  };

  renderSearchForm = () => {

    let searchClickHandler = () => {

      let message = null,
          venues = [],

          parseVenue = (venue, users) => { // ◄------ make a venue in own format
            return {
              id: venue.id,
              details: {
                name: venue.name,
                address: venue.location.formattedAddress.join(", "),
                rating: (venue => {
                  if (venue.rating && venue.ratingSignals) {
                    return venue.rating + " / " + venue.ratingSignals
                  } else {
                    return "0 / 0"
                }})(venue),
                photo: (venue => {
                  if (venue.featuredPhotos) {
                    return {
                      prefix: venue.featuredPhotos.items[0].prefix,
                      suffix: venue.featuredPhotos.items[0].suffix
                    }
                  }
                })(venue)
              },
              users: users
            }
          };

      if (this.state.searchInput) {
        message = {
          type: "near",
          position: this.state.searchInput
        }
      } else {
        if (this.state.position) {
          message = {
            type: "ll",
            position: this.state.position.lat + "," + this.state.position.long
          }
        } else {
          return
        }
      }
      axios.post("/venue/search", message)
      .then(res => {
        if (res.data.error) {
          this.setState({ bodyMessage: res.data.error.errorDetail })
        } else {
          res.data.venues.map(one => {
            axios.post("/venue/get", { id: one.venue.id })
            .then(res => {
              let users = [];
              if (res.data.message) {
                users = [];
              } else {
                users = res.data.venue.users;
              }
              venues.push(parseVenue(one.venue, users));
              this.setState({ bodyMessage: "", venues: venues });
            })
            .catch(err => console.log(err));
          });
        }
      })
    },

    getLocationClickHandler = () => {
      navigator.geolocation.getCurrentPosition((position) => {
        this.setState({ position: {
            lat: position.coords.latitude,
            long: position.coords.longitude
          },
          searchInputPlaceholder: "lan: " + position.coords.latitude.toFixed(2) +
              ", " + "long: " + position.coords.longitude.toFixed(2)
        })
      })
    },

    renderGetLocation = () => { // ◄-------------------- if supported by browser
      if ("geolocation" in navigator)
        return (
            <InputGroup.Button>
              <Button onClick={getLocationClickHandler}>
                <span className="glyphicon glyphicon-map-marker"/>
              </Button>
            </InputGroup.Button>
        )
    };

    return (
        <Navbar.Form className="form-group row"
                     name="searchform">
          <InputGroup>
            {renderGetLocation()}
            <FormControl className="text-center"
                         id="position"
                         type="text"
                         onChange={(event) => {
                           this.setState({ searchInput: event.target.value})
                         }}
                         placeholder={this.state.searchInputPlaceholder}
                         value={this.state.searchInput}/>
            <InputGroup.Button>
              <Button onClick={() => this.setState({ searchInput: ""})}>
                <span className="glyphicon glyphicon-stop"/>
              </Button>
            </InputGroup.Button>
            <InputGroup.Button>
              <Button onClick={searchClickHandler}>
                <span className="glyphicon glyphicon-search"/>
              </Button>
            </InputGroup.Button>
          </InputGroup>
        </Navbar.Form>
    )
  };

  renderHeader = () => {
    return (
        <div>
          <div id="name">
            nighty night&nbsp;
            <span id="byfoursquare">
              data sourced by Foursquare
            </span>
          </div>
          <div id="copyright">
          <span>
                dmiten |&nbsp;
            <a href="https://github.com/dmiten/FCC-backend-NightlifeCoordination"
               target="blank">
                <span className="fa fa-github"/>
              </a>
          </span>
            &nbsp;2017
          </div>
        </div>
    )
  };

  renderModal = () => {

    this.state.modal.header = this.state.modal.header.bind(this);
    this.state.modal.body = this.state.modal.body.bind(this);
    this.state.modal.footer = this.state.modal.footer.bind(this);

    return (

        <Modal bsSize="large"
               show={this.state.showModal}
               onHide={() => this.setState({ showModal: false })}>
          <Modal.Header closeButton>
            <Modal.Title>
              {this.state.modal.header()}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.modal.body()}
          </Modal.Body>
          <Modal.Footer>
            {this.state.modal.footer()}
          </Modal.Footer>
        </Modal>
    )
  };

  renderVenues = () => {
    let _venues = [];

    this.state.venues.map(
        venue => _venues.push(

            <Venue key={"main_" + venue.id}
                   venue={venue}
                   userMethods={{
                     addVenueToSelected: this.addVenueToSelected,
                     removeVenueFromSelected: this.removeVenueFromSelected
                   }}/>
        )
    );
    return _venues
  };

  addVenueToSelected = (venue) => {
    let _state = Object.assign({}, this.state);

    for (let i = 0; i < _state.selectedVenues.length; i++) {
      if (_state.selectedVenues[i].id === venue.id) {
        return
      }
    }
    _state.selectedVenues.push(venue);
    this.setState({ selectedVenues: _state.selectedVenues });
    this.userSync(venue);
  };

  removeVenueFromSelected = (venue) => {
    let _state = Object.assign({}, this.state);

    for (let i = 0; i < _state.selectedVenues.length; i++) {
      if (_state.selectedVenues[i].id === venue.id) {
        _state.selectedVenues.splice(i, 1);
        this.setState({ selectedVenues: _state.selectedVenues });
        this.userSync(venue);
        return
      }
    }
  };

  userSync = (venue) => { // ◄------------- sync mongo, sessionStorage & display
    let token = sessionStorage.getItem("token");

    if (token) {
      axios.post("/user/sync",
        { selectedVenues: this.state.selectedVenues },
        { headers: {"Authorization": token }})
      .catch(err => console.log(err));
      axios.post("/venue/sync", {venue: venue},
          { headers: {"Authorization": sessionStorage.getItem("token") }})
      .catch(err => console.log(err));

      sessionStorage.setItem("selectedVenues", JSON.stringify(this.state.selectedVenues));
    }

    let _venues = Object.assign([], this.state.venues); //

    for (let i = 0; i < _venues.length; i++) {
      if (_venues[i].id === venue.id) {
        _venues[i].users = venue.users;
        this.setState({ venues: _venues});
        break
      }
    }

  };

  renderMessage = () => {
    if (this.state.bodyMessage) {
      return (
          <div className="text-center"
               id="bodymessage">
            {this.state.bodyMessage}
          </div>
      )
    }
  };

  render() {
    return (
        <div className="container-fluide"
             id="maincontainer">
          {this.renderHeader()}
          {this.renderModal()}
          <div className="jumbotron"
               id="jumbotron">
            {this.renderNav()}
            {this.renderMessage()}
            {this.renderVenues()}
          </div>
        </div>
    )
  }
};