import React, { Component, PropTypes } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { Form, FormGroup, FormControl, ControlLabel, Button, Col } from 'react-bootstrap';
import request from 'superagent';
import consts from '../../store/consts';

import style from './style.css';
import 'react-datepicker/dist/react-datepicker.css';

const isValidText = text => {
  return (Boolean(text) && Boolean(text.trim()));
};

const getTextValidationState = (text, pristine) => {
  if (!pristine) {
    return null;
  }
  return isValidText(text) ? 'success' : 'error';
};

class TravelDetails extends Component {
  static propTypes = {
    changeCurrency: PropTypes.func.isRequired,
    details: PropTypes.shape({
      name: PropTypes.string,
      department: PropTypes.string,
      destination: PropTypes.shape({
        country: PropTypes.string,
        city: PropTypes.string,
      }),
      departureDate: PropTypes.number,
      returnDate: PropTypes.number,
      purpose: PropTypes.string,
    }),
    onSubmit: PropTypes.func.isRequired,
  }

  constructor(props){
    super(props);

    const { details } = props;
    if (!details) {
      this.state = {
        city: {
          pristine: false,
          value: '',
        },
        country: {
          pristine: false,
          value: '',
        },
        departureDate: moment(),
        numberOfPassengers: 1,
        passengerDepartment: {
          pristine: false,
          value: consts.departments[0],
        },
        passengerName: {
          pristine: false,
          value: '',
        },
        purpose: {
          pristine: false,
          value: '',
        },
        conferences:{
          pristine: false,
          value:'',
        },
        customers:{
          pristine: false,
          value:'',
        },
        returnDate: moment(),
      };
    } else {
      const { name, department, destination, numberOfPassengers, departureDate,
        returnDate, purpose, conferences, customers} = details;
      this.state = {
        city: {
          pristine: true,
          value: destination.city,
        },
        country: {
          pristine: true,
          value: destination.country,
        },
        departureDate: moment(departureDate),
        numberOfPassengers,
        passengerDepartment: {
          pristine: true,
          value: department,
        },
        passengerName: {
          pristine: true,
          value: name,
        },
        purpose: {
          pristine: true,
          value: purpose,
        },
        conferences:{
          pristine: true,
          value: conferences,
        },
        customers:{
          pristine: true,
          value: customers,
        },
        returnDate: moment(returnDate),
      };
    }
  }

  handleNameChange = e => {
    this.setState({ passengerName: {
      pristine: true,
      value: e.target.value,
    },
    });
  }

  handleCountryChange = e => {
    this.setState({ country: {
      pristine: true,
      value: e.target.value,
    },
    });
  }

  handleCityChange = e => {
    this.setState({ city: {
      pristine: true,
      value: e.target.value,
    },
    });
  }

  handleDepartmentChange = e => {
    this.setState({ passengerDepartment: {
      pristine: true,
      value: e.target.value,
    },
    });
  }

  handlePurposeChange = e => {
    this.setState({ purpose: {
      pristine: true,
      value: e.target.value,
    },
    });
  }

  handleConferencesChange = e => {
    this.setState({ conferences: {
      pristine: true,
      value: e.target.value,
    },
    });
  }

  handleCustomersChange = e => {
    this.setState({ customers: {
      pristine: true,
      value: e.target.value,
    },
    });
  }

  handleNumberPassengersChange = e => {
    this.setState({ numberOfPassengers: parseInt(e.target.value) });
  }

  handleDepartureChange = date => {
    const { returnDate } = this.state;
    if (date.isAfter(returnDate)) {
      return this.setState({ departureDate: returnDate, returnDate: date});
    }
    this.setState({ departureDate: date });
    let apiDate = date.toDate();
    if (apiDate.getDay()===6){
      apiDate.setDate(apiDate.getDate()-1);
    }else if (apiDate.getDay()===0){
      apiDate.setDate(apiDate.getDate()-2);
    }

    request.get(`/api/rate/01/${apiDate.toLocaleDateString('il-HE',{year:'numeric'})}/${apiDate.toLocaleDateString('il-HE',{month:'numeric'})}/${apiDate.toLocaleDateString('il-HE',{day:'numeric'})}`)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .end((err, res)=>{
      if (err) {
        console.error(err);
      }

      if(!err && res.body && res.body.rate){
        try {
          const usd = parseFloat(res.body.rate);
          this.props.changeCurrency({usd});
        } catch (e) {
          this.props.changeCurrency({usd: undefined});
        }
      }else {
        this.props.changeCurrency({usd: undefined});
      }
    });
  }

  handleReturnChange = date => {
    const { departureDate } = this.state;
    if (date.isBefore(departureDate)) {
      return this.setState({ returnDate: departureDate, departureDate: date});
    }
    this.setState({ returnDate: date });
  }

  isFormValid = () => {
    const { passengerName, passengerDepartment, country, city, purpose, conferences, customers } = this.state;
    return isValidText(passengerName.value) &&
           isValidText(passengerDepartment.value) &&
           isValidText(city.value) &&
           isValidText(country.value) &&
          //  isValidText(conferences.value) &&
          //  isValidText(customers.value) &&
           isValidText(purpose.value);
  }

  handleSubmitClick = () => {
    const { onSubmit } = this.props;
    if (!this.isFormValid()) {
      return;
    }

    const {
      passengerName: { value: name },
      passengerDepartment: { value: department },
      city: { value: city },
      country: { value: country },
      numberOfPassengers,
      departureDate,
      returnDate,
      purpose: { value: purpose },
      conferences: { value: conferences },
      customers: { value: customers },
    } = this.state;
    const totalNumberOfDays = returnDate.diff(departureDate, 'days') - 1;

    onSubmit({
      name,
      department,
      destination: {
        city,
        country,
      },
      numberOfPassengers,
      departureDate: departureDate.valueOf(),
      returnDate: returnDate.valueOf(),
      purpose,
      conferences,
      customers,
      totalNumberOfDays,
    });
  }

  render() {
    const {
      passengerName,
      passengerDepartment,
      city,
      country,
      numberOfPassengers,
      departureDate,
      returnDate,
      purpose,
      conferences,
      customers,
    } = this.state;

    const numberOfDays = returnDate.diff(departureDate, 'days') + 1;
    return (
      <Form horizontal>
        <h2>Travel's Details</h2>
        <FormGroup
            controlId="passenger-name"
            validationState={getTextValidationState(passengerName.value, passengerName.pristine)}
        >
            <ControlLabel className="col-sm-4">Passenger Name</ControlLabel>
            <Col sm={8}>
            <FormControl
                defaultValue={passengerName.value}
                onChange={this.handleNameChange}
                placeholder="Firstname and Lastname"
                required
                type="text"
            />
            </Col>
        </FormGroup>
        <FormGroup
            controlId="passenger-department"
            validationState={getTextValidationState(passengerDepartment.value, passengerDepartment.pristine)}
        >
            <ControlLabel className="col-sm-4">Passenger Department</ControlLabel>
            <Col sm={8}>
                <FormControl
                    componentClass="select"
                    defaultValue={passengerDepartment.value}
                    onChange={this.handleDepartmentChange}
                    placeholder="R&D\ PS\ Sales\ ..."
                >
                  {
                    consts.departments.map(department=><option key={department} value={department}>{department}</option>)
                  }
                </FormControl>
            </Col>
        </FormGroup>
        <label className="control-label col-sm-4">Destination</label>
        <FormGroup
            className={style.destinationGroup}
            controlId="destination-country"
            validationState={getTextValidationState(country.value, country.pristine)}
        >
            <FormControl
                defaultValue={country.value}
                onChange={this.handleCountryChange}
                placeholder="US\ IL\ ..."
                type="text"
            />
        </FormGroup>
        <FormGroup
            className={style.destinationGroup}
            controlId="destination-city"
            validationState={getTextValidationState(city.value, city.pristine)}
        >
            <FormControl
                defaultValue={city.value}
                onChange={this.handleCityChange}
                placeholder="NY\ Tel-Aviv\ ..."
                type="text"
            />
        </FormGroup>
        <FormGroup controlId="number-of-passengers">
            <ControlLabel className="col-sm-4">Number of Passengers</ControlLabel>
            <Col sm={8}>
                <FormControl
                    defaultValue={numberOfPassengers}
                    min={0}
                    onChange={this.handleNumberPassengersChange}
                    type="number"
                />
            </Col>
        </FormGroup>
        <FormGroup controlId="departure-date">
            <ControlLabel className="col-sm-4">Departure Date</ControlLabel>
            <Col sm={8}>
                <DatePicker
                    customInput={<DatePickerButton />}
                    defaultValue={departureDate}
                    endDate={returnDate}
                    onChange={this.handleDepartureChange}
                    selected={departureDate}
                    selectsStart
                    startDate={departureDate}
                />
            </Col>
        </FormGroup>
        <FormGroup controlId="return-date">
            <ControlLabel className="col-sm-4">Return Date</ControlLabel>
            <Col sm={8}>
                <DatePicker
                    customInput={<DatePickerButton />}
                    defaultValue={returnDate}
                    endDate={returnDate}
                    onChange={this.handleReturnChange}
                    selected={returnDate}
                    selectsEnd
                    startDate={departureDate}
                />
            </Col>
        </FormGroup>
        <FormGroup controlId="number-of-days">
            <ControlLabel className="col-sm-4">Number of Days</ControlLabel>
            <Col sm={8}>
                <FormControl.Static>{numberOfDays}</FormControl.Static>
            </Col>
        </FormGroup>
        <FormGroup
            controlId="purpose"
            validationState={getTextValidationState(purpose.value, purpose.pristine)}
        >
            <ControlLabel className="col-sm-4">Travel Purpose</ControlLabel>
            <Col sm={8}>
            <FormControl
                defaultValue={purpose.value}
                onChange={this.handlePurposeChange}
                placeholder="Convention and Customer\ Integration with NY offiece\ ..."
                type="text"
            />
            </Col>
        </FormGroup>
        <FormGroup
            controlId="conferences"
        >
            <ControlLabel className="col-sm-4">Conference\s Name</ControlLabel>
            <Col sm={8}>
            <FormControl
                defaultValue={conferences.value}
                onChange={this.handleConferencesChange}
                placeholder="Sisense Connect\ Strata conference\ ..."
                type="text"
            />
            </Col>
        </FormGroup>
        <FormGroup
            controlId="customers"
        >
            <ControlLabel className="col-sm-4">Customer\s Name</ControlLabel>
            <Col sm={8}>
            <FormControl
                defaultValue={customers.value}
                onChange={this.handleCustomersChange}
                placeholder="GE\ Ebay\ Philips\ Pronhub\ ..."
                type="text"
            />
            </Col>
        </FormGroup>
        <Button
            bsStyle="primary"
            className="pull-right"
            disabled={!this.isFormValid()}
            onClick={this.handleSubmitClick}
        >
          Continue
        </Button>
      </Form>
    );
  }
}

export default TravelDetails;

const DatePickerButton = React.createClass({
  propTypes: {
    onClick: PropTypes.func,
    value: PropTypes.string,
  },

  render () {
    return (
        <Button onClick={this.props.onClick} >
            {this.props.value}
        </Button>
    );
  },
});
