'use strict';

const db = require('sqlite');

module.exports = {
    get(req, res) {
        let organisations;
        db.all('select * from organisation')
        .then(function(orgz){
            organisations = orgz;
            return Promise.all(orgz.map(function(organisation){
                return db.all('select Name from Service ' +
                              'join OrganisationService On Service.Id = Organisationservice.ServiceId ' +
                              'where OrganisationService.organisationId='+organisation.Id)

            }));
        })
        .then(function(servicesOffered){
            for(var i=0; i<organisations.length; i++){
                organisations[i].Services=servicesOffered[i];
            }
           
        })
        .then(function(){
            return Promise.all(organisations.map(function(organisation){
                return db.all('select Name,Email from User '+
                             'join ContactUserOrganisation On User.Id = ContactUserOrganisation.UserId ' +
                             'where ContactUserOrganisation.organisationId ='+organisation.Id)
            }));
        })
        .then(function(userDetails){
            console.log(userDetails);
            for(var i=0; i<organisations.length; i++){
                organisations[i].Contacts=userDetails[i];
            }
        })
        .then(function(){
         res.json(organisations)   
     })

        .catch((error)=>{
            console.log(error)
            res.status(400).send('You failed to Deliver, Simon Said you must!')
        })

        
    },

    add(req, res) {
        let organisations;
        db.all('select * from organisation')
        .then(function(addOrgz){
            organisations = addOrgz;
            return Promise.all(newOrgz.map(function(organisation){
                return db.all("insert into Organisation values (4,'Shelter', '88 Old Street', 'London', 'EC1V 9HU', '0344 515 2000')")


            }));
        })

        res.status(404).json({ error: 'Not found' });
    },

    update(req, res) {
        // const id = req.params.id;
        // const data = request.body;
        let organisations;
        db.all('select * from organisation')
        .then(function(UpdatedOrgz){
            organisations = UpdatedOrgz;
            return Promise.all(newOrgz.map(function(organisation){
                return db.all("Update Organisation set Address='90 Old Road', City = 'Manchester', PostCode='M13 9HU', Telephone='0344 515 3000' where Id=1")

            }));
        })
        res.status(404).json({ error: 'Not found' });
    },

    remove(req, res) {

        res.status(404).json({ error: 'Not found' });
    }
};