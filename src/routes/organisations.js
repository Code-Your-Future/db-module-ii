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
                              'where OrganisationService.organisationid='+organisation.Id)

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
                             'join ContactUserOrganisation On User.Id = ContactUserOrganisation.UserId '
                             +'where ContactUserOrganisation.organisationId ='+organisation.Id)
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
        res.status(404).json({ error: 'Not found' });
    },

    update(req, res) {
        res.status(404).json({ error: 'Not found' });
    },

    remove(req, res) {
        res.status(404).json({ error: 'Not found' });
    }
};