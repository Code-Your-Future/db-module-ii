'use strict';

const db = require('sqlite');

module.exports = {
    get(req, res) {
        let organisations;
        db.all('select * from organisation')
        .then(function(listOfOrganisations){
            organisations = listOfOrganisations;
            return Promise.all(listOfOrganisations.map(function(organisation){
                return db.all('select Name from Service '+
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
            // console.log(userDetails);
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
        return db.all("insert into Organisation values (4,'Shelter', '88 Old Street', 'London', 'EC1V 9HU', '0344 515 2000') ") 
        
        .then(function(organisations){
          res.json(organisations)   
        })

        .catch((error)=>{
            console.log(error)
            res.status(400).send('You failed to Deliver, Simon Said you must!')
        });
    },

    update(req, res) {
        let organisations;
        return db.all("Update Organisation set Address='90 Old Road', City = 'Manchester', PostCode='M13 9HU', Telephone='0344 515 3000' where Id=1")

        .then(function(organisations){
          res.json(organisations)   
        })

        .catch((error)=>{
            console.log(error)
            res.status(400).send('You failed to Deliver, Simon Said you must!')
        });
    },

    remove(req, res) {
        let organisations;
         return db.all('DELETE FROM ' +
            'OrganisationService WHERE OrganisationId = 2 ')
         .then(function() {
            return db.all('delete from Organisation WHERE Organisation.Id = 2')        
            })

        .then(function(organisations){
          res.json(organisations)   
        })

        .catch((error)=>{
            console.log(error)
            res.status(400).send('You failed to Deliver, Simon Said you must!')
        });
    },
};

/*
select  thing
from table
where thing=1 and thing=2

*/