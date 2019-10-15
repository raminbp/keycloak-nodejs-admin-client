// tslint:disable:no-unused-expression
import * as chai from 'chai';
import {KeycloakAdminClient} from '../src/client';
import {credentials} from './constants';
import faker from 'faker';
import ClientRepresentation from '../src/defs/clientRepresentation';
import {DecisionStrategy, Logic} from "../src/defs/policyRepresentation";

const expect = chai.expect;

declare module 'mocha' {
  // tslint:disable-next-line:interface-name
  interface ISuiteCallbackContext {
    kcAdminClient?: KeycloakAdminClient;
    currentClient?: ClientRepresentation;
    currentRoleName?: string;
  }
}

describe('Clients', function() {
  before(async () => {
    this.kcAdminClient = new KeycloakAdminClient();
    await this.kcAdminClient.auth(credentials);

    // create client and also test it
    // NOTICE: to be clear, clientId stands for the property `clientId` of client
    // clientUniqueId stands for property `id` of client
    const clientId = faker.internet.userName();
    const createdClient = await this.kcAdminClient.clients.create({
      clientId,
      secret: 'mysecret',
      serviceAccountsEnabled: true,
      authorizationServicesEnabled: true,
    });
    expect(createdClient.id).to.be.ok;

    const client = await this.kcAdminClient.clients.findOne({
      id: createdClient.id,
    });
    expect(client).to.be.ok;
    this.currentClient = client;
  });

  after(async () => {
    // delete the current one
    await this.kcAdminClient.clients.del({
      id: this.currentClient.id,
    });
  });

  it('list clients', async () => {
    const clients = await this.kcAdminClient.clients.find();
    expect(clients).to.be.ok;
  });

  it('get single client', async () => {
    const clientUniqueId = this.currentClient.id;
    const client = await this.kcAdminClient.clients.findOne({
      id: clientUniqueId,
    });
    // not sure why entity from list api will not have property: authorizationServicesEnabled
    expect(client).to.deep.include(this.currentClient);
  });

  it('update single client', async () => {
    const {clientId, id: clientUniqueId} = this.currentClient;
    await this.kcAdminClient.clients.update(
      {id: clientUniqueId},
      {
        // clientId is required in client update. no idea why...
        clientId,
        description: 'test',
      },
    );

    const client = await this.kcAdminClient.clients.findOne({
      id: clientUniqueId,
    });
    expect(client).to.include({
      description: 'test',
    });
  });

  it('delete single client', async () => {
    // create another one for delete test
    const clientId = faker.internet.userName();
    const {id} = await this.kcAdminClient.clients.create({
      clientId,
    });

    // delete it
    await this.kcAdminClient.clients.del({
      id,
    });

    const delClient = await this.kcAdminClient.clients.findOne({
      id,
    });
    expect(delClient).to.be.null;
  });

  /**
   * client roles
   */
  describe('client roles', () => {
    before(async () => {
      const roleName = faker.internet.userName();
      // create a client role
      const {
        roleName: createdRoleName,
      } = await this.kcAdminClient.clients.createRole({
        id: this.currentClient.id,
        name: roleName,
      });

      expect(createdRoleName).to.be.equal(roleName);

      // assign currentClientRole
      this.currentRoleName = roleName;
    });

    after(async () => {
      // delete client role
      await this.kcAdminClient.clients.delRole({
        id: this.currentClient.id,
        roleName: this.currentRoleName,
      });
    });

    it('list the client roles', async () => {
      const roles = await this.kcAdminClient.clients.listRoles({
        id: this.currentClient.id,
      });

      expect(roles[0]).to.include({
        name: this.currentRoleName,
      });
    });

    it('find the client role', async () => {
      const role = await this.kcAdminClient.clients.findRole({
        id: this.currentClient.id,
        roleName: this.currentRoleName,
      });

      expect(role).to.include({
        name: this.currentRoleName,
        clientRole: true,
        containerId: this.currentClient.id,
      });
    });

    it('update the client role', async () => {
      // NOTICE: roleName MUST be in the payload, no idea why...
      const delta = {
        name: this.currentRoleName,
        description: 'test',
      };
      await this.kcAdminClient.clients.updateRole(
        {
          id: this.currentClient.id,
          roleName: this.currentRoleName,
        },
        delta,
      );

      // check the change
      const role = await this.kcAdminClient.clients.findRole({
        id: this.currentClient.id,
        roleName: this.currentRoleName,
      });

      expect(role).to.include(delta);
    });

    it('delete a client role', async () => {
      const roleName = faker.internet.userName();
      // create a client role
      await this.kcAdminClient.clients.createRole({
        id: this.currentClient.id,
        name: roleName,
      });

      // delete
      await this.kcAdminClient.clients.delRole({
        id: this.currentClient.id,
        roleName,
      });

      // check it's null
      const role = await this.kcAdminClient.clients.findRole({
        id: this.currentClient.id,
        roleName,
      });

      expect(role).to.be.null;
    });
  });

  describe('client secret', () => {
    before(async () => {
      const {clientId, id: clientUniqueId} = this.currentClient;
      // update with serviceAccountsEnabled: true
      await this.kcAdminClient.clients.update(
        {
          id: clientUniqueId,
        },
        {
          clientId,
          serviceAccountsEnabled: true,
        },
      );
    });

    it('get client secret', async () => {
      const credential = await this.kcAdminClient.clients.getClientSecret({
        id: this.currentClient.id,
      });

      expect(credential).to.have.all.keys('type', 'value');
    });

    it('generate new client secret', async () => {
      const newCredential = await this.kcAdminClient.clients.generateNewClientSecret(
        {
          id: this.currentClient.id,
        },
      );

      const credential = await this.kcAdminClient.clients.getClientSecret({
        id: this.currentClient.id,
      });

      expect(newCredential).to.be.eql(credential);
    });

    it('get service account user', async () => {
      const serviceAccountUser = await this.kcAdminClient.clients.getServiceAccountUser(
        {
          id: this.currentClient.id,
        },
      );

      expect(serviceAccountUser).to.be.ok;
    });
  });

  // describe('client authorization resources', () => {
  //     it('should create a resource', async () => {
  //       const resource = {
  //         // attributes?: Record<string, any>;
  //         // displayName: faker.name,
  //         owner: {
  //           name: faker.name.
  //         },
  //         ownerManagedAccess: '',
  //         scopes: '',
  //         type: '',
  //         uri: ''
  //       };
  //       await this.kcAdminClient.clients.createClientResource({id: this.currentClient.id}, )
  //     })
  // })

  describe('authorization permissions', () => {
      it('should return permissions', async () => {
        const permissions = await this.kcAdminClient.clients.getClientPermissions({id: this.currentClient.id});
        expect(permissions).to.be.ok;
      });

      it('should create a new permission', async () => {
        const permission = await this.kcAdminClient.clients.createPermission({
          id: this.currentClient.id,
          name: faker.lorem.word(),
          type: 'resource',
          // logic: Logic.POSITIVE,
          // decisionStrategy: DecisionStrategy.UNANIMOUS,
          // policies: [],
          // resources: [],
        });
        expect(permission).to.be.ok;
      })
  });

  describe('authorization resources', () => {
    it('should return resources', async () => {
      const resources = await this.kcAdminClient.clients.getClientResources({id: this.currentClient.id});
      expect(resources).to.be.ok;
    });

    it('should create a new resource', async () => {
      const resource = await this.kcAdminClient.clients.createClientResource({
        id: this.currentClient.id,
        name: faker.lorem.word(),
        displayName: faker.lorem.word(),
        type: faker.lorem.word(),
      });
      expect(resource).to.be.ok;
      expect(resource._id).to.be.not.null;
    });

    it('should remove a resource', async () => {
      const resource = await this.kcAdminClient.clients.createClientResource({
        id: this.currentClient.id,
        name: faker.lorem.word(),
        displayName: faker.lorem.word(),
        type: faker.lorem.word(),
      });
      await this.kcAdminClient.clients.deleteResource({id: this.currentClient.id, resourceId: resource._id});
    });
  });


  describe('authorization policies', () => {
    it('should return policies', async () => {
      const policies = await this.kcAdminClient.clients.getPolicies({id: this.currentClient.id});
      expect(policies).to.be.ok;
    });

    it('should create a new policy', async () => {
      const resource = await this.kcAdminClient.clients.createPolicy({
        id: this.currentClient.id,
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
        logic: Logic.POSITIVE,
        type: 'js',
        decisionStrategy: DecisionStrategy.UNANIMOUS
      });
      expect(resource).to.be.ok;
    });
    //
    // it('should remove a policy', async () => {
    //   const resource = await this.kcAdminClient.clients.createClientResource({
    //     id: this.currentClient.id,
    //     name: faker.lorem.word(),
    //     displayName: faker.lorem.word(),
    //     type: faker.lorem.word(),
    //   });
    //   await this.kcAdminClient.clients.deleteResource({id: this.currentClient.id, resourceId: resource._id});
    // });
  });
});
