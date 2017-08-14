"use strict";

import React from "react";

import {
  Alert,
  Button,
  ButtonGroup,
  Col,
  Grid,
  Image,
  Label,
  Panel,
  Row
} from "react-bootstrap";

import "./app.css";

export default class Venue extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      venue: this.props.venue
    };
  }

  incUsersList() { // ◄---------------------------------- add user to this venue
    let userId = sessionStorage.getItem("userId");

    if (userId) {

      let _state = Object.assign({}, this.state),
          userIndex = _state.venue.users.indexOf(userId);

      if (userIndex === -1) { // ◄------------------ user isn't present in venue
        _state.venue.users.push(userId);
        this.props.userMethods.addVenueToSelected(_state.venue);
        this.setState({ venue: _state.venue });
      }
    }
  }

  decUsersList() { // ◄----------------------------- remove user from this venue
    let userId = sessionStorage.getItem("userId");

    if (userId) {

      let _state = Object.assign({}, this.state),
          userIndex = _state.venue.users.indexOf(userId);

      if (userIndex !== -1) { // ◄-------------------- user is present in venue
        _state.venue.users.splice(userIndex, 1);
        this.props.userMethods.removeVenueFromSelected(_state.venue);
        this.setState({ venue: _state.venue });
      }
    }
  }

  render() {
    let elements,
        imageSrc = this.state.venue.details.photo ?
          this.state.venue.details.photo.prefix + "100x100" +
            this.state.venue.details.photo.suffix :
          "noimagestub100x100.jpg",

        link = "https://foursquare.com/v/" + this.state.venue.id;

    if (sessionStorage.getItem("userId")) { // ◄--------- elements for auth user

      elements =

          <div className="ctrlinvenue"
               id="authblock">
            add/remove
            <br/>
            <ButtonGroup>
              <Button onClick={() => this.decUsersList()}>
                -
              </Button>
              <Button onClick={() => this.incUsersList()}>
                +
              </Button>
            </ButtonGroup>
            <br/>
            to selected
          </div>

    } else {

      elements =

          <Alert className="ctrlinvenue" id="unauthblock">
            <i>have to</i><br/>
            <i>signup/login</i><br/>
            <i>for maximum nightynight</i>
          </Alert>
    }

    return (

        <Panel className="venues">
          <Grid>
            <Row>
              <Col sm={3} md={3}>
                <Image rounded src={imageSrc}/>
              </Col>
              <Col sm={4} md={4}>
                <b>name:</b>&nbsp;{this.state.venue.details.name}<br/>
                <span className="fa fa-thumbs-up"/>&nbsp;:&nbsp;
                <Label>
                  {this.state.venue.details.rating}
                </Label>
                <br/>
                <span className="fa fa-map-marker"/>&nbsp;:&nbsp;
                {this.state.venue.details.address}
                <br/>
                <a href={link}
                   target="blank">
                  <span className="fa fa-foursquare"/>
                </a>
              </Col>
              <Col sm={3} md={3}>
                <Label>
                  {this.state.venue.users.length}
                </Label>
                &nbsp;plan to visit
                <br/>
                {elements}
              </Col>
            </Row>
          </Grid>
        </Panel>
    )
  }
}