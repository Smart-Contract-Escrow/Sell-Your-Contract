import './App.css';
import { Stepper, Step, StepLabel } from '@mui/material';

function App() {

  const steps = ['Step One', 'Step Two', 'Step Three']

  return (
    <div className="App">
      <div><h1>Seller</h1></div>
      <Stepper activeStep={1} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div><h1>Buyer</h1></div>
      <Stepper activeStep={2} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
}

export default App;
