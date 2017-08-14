"use strict";

import axios from "axios";
import React from "react";
import {
  Button,
  Form,
  FormControl
} from "react-bootstrap";

import Venue from "./venue.jsx";

import "./app.css";

const modals = {};

export default modals;

let validateEmail = (email) => {

    let regExp = new RegExp("^(([^<>()\\[\\]\\\\.,;:\\s@\"]+(\\.[^<>()\\[\\" +
                            "]\\\\.,;:\\s@\"]+)*)|(\".+\"))@((\\[[0-9]{1,3}" +
                            "\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a" +
                            "-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$", "i");
      return regExp.test(email);
    },

    getValue = (name) => document.forms.modalform.elements[name].value,

    isEmpty = (elName) => !document.forms.modalform.elements[elName].value,

    passNotMatched = () => getValue("password") !== getValue("confirmpassword"),

    showStatusMessage = (message) => {
      document.getElementById("modalmessage").innerHTML = message;
    },

    onClick = function(name) { // ◄-- shared onClick handler for signup & login

      if (isEmpty("email") || isEmpty("password")) {
        showStatusMessage("email & password can't be empty");
        return;
      }

      if (!validateEmail(getValue("email"))) {
        showStatusMessage("strange email");
        return;
      }

      if (name === "signup") { // ◄---------------------- in case of signup form
        if (passNotMatched()) {
          showStatusMessage("password not confirmed");
          return;
        }
        if (sessionStorage.getItem("token")) {
          showStatusMessage("you have to logged out first");
          return;
        }
      }

      if (name === "login" && sessionStorage.getItem("token")) {
        showStatusMessage("you logged in as " + sessionStorage.getItem("name") +
            " already");
        return;
      }

      axios.post("/user/" + name, {
        email: getValue("email"),
        password: getValue("password")
      })
      .then(res => {
        if (res.data.token) {
          sessionStorage.setItem("name", res.data.username);
          sessionStorage.setItem("token", res.data.token);
          sessionStorage.setItem("userId", res.data.userId);
        }
        if (name === "login" && res.data.selectedVenues) {
          sessionStorage.setItem("selectedVenues",
              JSON.stringify(res.data.selectedVenues));
          this.setState({
            selectedVenues: res.data.selectedVenues,
            userId: res.data.userId
          });
        }
        showStatusMessage(res.data.message);
      })
      .catch(err => {
        showStatusMessage(err.message);
      });
    };

modals.signup = {

  header: function() { // ◄----------------------------------------- signup form
    return (

        <div className="text-center">
          <span className="fa fa-sign-in">&nbsp;</span>
          signup
        </div>

    )
  },

  body: function() {
    return (

        <div>
          <Form horizontal
                name="modalform">
              <FormControl className="forminput"
                           name="email"
                           placeholder="email"
                           type="email"/>
              <FormControl className="forminput"
                           name="password"
                           placeholder="password"
                           type="password"/>
              <FormControl className="forminput"
                           name="confirmpassword"
                           placeholder="confirm password"
                           type="password"/>
          </Form>
          <div className="text-center">
            <span id="modalmessage">&nbsp;</span>
          </div>
        </div>

    )
  },

  footer: function() {
    return (

        <div>
          <Button onClick={() => this.setState({ showModal: false })}>
            close
          </Button>
          <Button bsStyle="primary"
                  onClick={() => onClick.bind(this)("signup")}>
            signup
          </Button>
        </div>

    )
  }
};

modals.login = { // ◄------------------------------------------------ login form

  header: function() {
    return (

        <div className="text-center">
          <span className="fa fa-sign-in"/>
          &nbsp;login
        </div>

    )
  },

  body: function() {
    return (

        <div>
          <Form horizontal
                name="modalform">
            <FormControl className="forminput"
                         name="email"
                         placeholder="email"
                         type="email"/>
            <FormControl className="forminput"
                         name="password"
                         placeholder="password"
                         type="password"/>
          </Form>
          <div className="text-center">
            <span id="modalmessage">&nbsp;</span>
          </div>
        </div>

    )
  },

  footer: function() {
    return (

        <div>
          <Button onClick={() => this.setState({ showModal: false })}>
            close
          </Button>
          <Button bsStyle="primary"
                  onClick={() => onClick.bind(this)("login")}>
            login
          </Button>
        </div>

    )
  }

};

modals.logout = { // ◄---------------------------------------------- logout form

  header: function() {
    return (

        <div className="text-center">
          <span className="fa fa-sign-out"/>
          &nbsp;logout
        </div>

    )
  },

  body: function() {
    return (

        <div>
          <text>
            you are going to logout
          </text>
          <div className="text-center">
            <span id="modalmessage">&nbsp;</span>
          </div>
        </div>

    )
  },

  footer: function() {
    return (

        <div>
          <Button onClick={() => this.setState({showModal: false})}>
            close
          </Button>
          <Button bsStyle="primary"
                  onClick={() => {
                    axios.post("/user/logout",
                        {name: sessionStorage.getItem("name")},
                        { headers: {
                            "Authorization": sessionStorage.getItem("token")
                        }}
                      )
                    .then(res => {
                      showStatusMessage(res.data.message);
                      sessionStorage.removeItem("name");
                      sessionStorage.removeItem("token");
                      sessionStorage.removeItem("userId");
                      sessionStorage.removeItem("selectedVenues");
                      this.setState({ selectedVenues: [] });
                    })
                    .catch(err => {
                      showStatusMessage(err.message)
                    })
                  }}>
            logout
          </Button>
        </div>

    )
  }
};

modals.selectedVenues = { // ◄---------------------- list of the selected venues

  header: function() {
    return (

      <div className="text-center">
        <span className="fa fa-check-circle-o"/>
        &nbsp;selected
      </div>

    )
  },

  body: function() {

    let _venues = [];

    this.state.selectedVenues.map(
        venue => _venues.push(

            <Venue key={"selected_" + venue.id}
                   venue={venue}
                   userMethods={{
                     addVenueToSelected: this.addVenueToSelected,
                     removeVenueFromSelected: this.removeVenueFromSelected
                   }}/>
        )
    );
    return _venues
  },

  footer: function() {
    return (

        <div>
          <Button onClick={() => this.setState({showModal: false})}>
            close
          </Button>
        </div>

    )
  }
};