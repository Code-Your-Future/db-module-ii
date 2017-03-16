'use strict';

const db = require('sqlite');

const getPromise =(promise,sqlStatement)=>{
    return Promise.all(promise.map(data => {
        return db.all(`${sqlStatement}${data.Id}`);
    }));
}

const getDML = (sqlStetment,values) => {
    return db.run(sqlStetment,values)
}

module.exports = {
    get(req, res) {
        let organisation;
        const orgStatement=`Select * From Organisation`;
        const serviceStatement = `SELECT Name FROM Service
                                  INNER JOIN OrganisationService ON
                                  (Service.Id=OrganisationService.ServiceId)
                                  WHERE OrganisationService.organisationId=`;
        const userStatement = `SELECT Name, Email FROM User
                               INNER JOIN ContactUserOrganisation ON
                               (User.Id = ContactUserOrganisation.UserId)
                               WHERE ContactUserOrganisation.organisationId =`
       
        db.all(orgStatement)
        .then(org =>{
            organisation = org;
            return getPromise(org,serviceStatement);
        })
        .then(service =>{
            for(var i=0; i<organisation.length; i++){
                organisation[i].Services=service[i];
            }
        })
        .then(()=>{
            return getPromise(organisation,userStatement)
        })
        .then(users =>{
            for(var i=0; i<organisation.length; i++){
                organisation[i].Contacts=users[i];
            }
        })
        .then(() => res.json(organisation)) 
        .catch((err) => res.status(404).json({ error: 'Not found! error :' + err}));        
    },

    add(req, res) {
        const formValues=req.body;
        const insertStatement = `INSERT INTO Organisation 
                                 VALUES (?,?,?,?,?,?)`;    
        const values = Object.keys(formValues).map((key)=> (key === 'Id') ? Number(formValues[key]): formValues[key]);
        const lastRecord=`Select * FROM organisation where organisation.Id=${values[0]}`;
          
        getDML(insertStatement,values)
        .then(()=>{
            res.status(200).json({success:'OK'});
        })
        .then(()=>{
            db.all(lastRecord)
            .then(lastOrganization => res.status(200).json(lastOrganization))
            .catch((err)=> res.status(500).json({error: 'Last recored not fetch - ' + err}))
        })
        .catch((err)=> res.status(500).json({Error:'Insert not succeeded ' + err}))
    },

    update(req, res) {
        const id = req.params.id;
        const formValues=req.body;
        const statement = `UPDATE Organisation 
                           SET Address=?, City=?, PostCode=?, Telephone=? WHERE Organisation.Id=?`;
        const lastRecord = `Select * FROM organisation where organisation.Id=${id}`;
        
        const values = Object.keys(formValues).map((key)=> formValues[key]);        
        values.push(Number(id));
        getDML(statement,values)
        .then(()=>{
            db.all(lastRecord)
            .then(lastOrganization => res.json(lastOrganization))
            .catch((err)=> res.status(500).json({error: 'Last recored not fetch - ' + err}))
        })
        .catch((err)=> res.status(500).json({ error: 'Update not succeeded ' + err }));
    },

    remove(req, res) {
        const id = req.params.id;
        const selectOrgName = `SELECT Name FROM Organisation`;
        const deleteStatement = ["DELETE FROM OrganisationService" +
                                 " WHERE OrganisationService.OrganisationId=?",
                                 "DELETE FROM ContactUserOrganisation WHERE ContactUserOrganisation.OrganisationId=?",
                                 "DELETE FROM Organisation WHERE Organisation.Id=?"];
        deleteStatement.map(statement => {
            getDML(statement,id)
            .then(()=> {
                db.all(selectOrgName)
                .then(lastOrganization => res.json(lastOrganization))
                .catch((err)=> res.status(500).json({error: 'Last recored not fetch - ' + err}))
            })
            .catch((err)=> res.status(500).json({ error: 'Delete not succeeded' + err }));
        })
    }
};