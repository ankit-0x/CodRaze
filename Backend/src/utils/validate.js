const validator = require('validator');
const validate = (data)=>{
    const mandatoryField = ['firstName', 'emailId', 'password'];
    const IsAllowed = mandatoryField.every((k)=>Object.keys(data).includes(k));

    if(!IsAllowed)
        throw new Error('Some Field Missing');

    if(!validator.isEmail(data.emailId))
        throw new Error('Invalid Email');

    if(!validator.isStrongPassword(data.password))
        throw new Error("Weak Password");
    
    if(!(data.firstName.length >=3 && data.firstName.length <=20))
        throw new Error('Name should have atleast 3 character and atmost 20 character');
}

module.exports = validate;