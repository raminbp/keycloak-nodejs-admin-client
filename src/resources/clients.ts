import Resource from './resource';
import ClientRepresentation from '../defs/clientRepresentation';
import {KeycloakAdminClient} from '../client';
import RoleRepresentation from '../defs/roleRepresentation';
import UserRepresentation from '../defs/userRepresentation';
import CredentialRepresentation from '../defs/credentialRepresentation';
import ResourceRepresentation from '../defs/resourceRepresentation';
import PolicyRepresentation from '../defs/policyRepresentation';
import ResourcePermissionRepresentation from '../defs/resourcePermissionRepresentation';
import {stringify} from 'querystring';

export interface ClientQuery {
  clientId?: string;
  viewableOnly?: boolean;
}

export class Clients extends Resource<{realm?: string}> {
  public find = this.makeRequest<ClientQuery, ClientRepresentation[]>({
    method: 'GET',
  });

  public create = this.makeRequest<ClientRepresentation, {id: string}>({
    method: 'POST',
    returnResourceIdInLocationHeader: {field: 'id'},
  });

  /**
   * Single client
   */

  public findOne = this.makeRequest<{id: string}, ClientRepresentation>({
    method: 'GET',
    path: '/{id}',
    urlParamKeys: ['id'],
    catchNotFound: true,
  });

  public update = this.makeUpdateRequest<
    {id: string},
    ClientRepresentation,
    void
  >({
    method: 'PUT',
    path: '/{id}',
    urlParamKeys: ['id'],
  });

  public del = this.makeRequest<{id: string}, void>({
    method: 'DELETE',
    path: '/{id}',
    urlParamKeys: ['id'],
  });

  /**
   * Client roles
   */

  public createRole = this.makeRequest<RoleRepresentation, {roleName: string}>({
    method: 'POST',
    path: '/{id}/roles',
    urlParamKeys: ['id'],
    returnResourceIdInLocationHeader: {field: 'roleName'},
  });

  public listRoles = this.makeRequest<{id: string}, RoleRepresentation[]>({
    method: 'GET',
    path: '/{id}/roles',
    urlParamKeys: ['id'],
  });

  public findRole = this.makeRequest<
    {id: string; roleName: string},
    RoleRepresentation
  >({
    method: 'GET',
    path: '/{id}/roles/{roleName}',
    urlParamKeys: ['id', 'roleName'],
    catchNotFound: true,
  });

  public updateRole = this.makeUpdateRequest<
    {id: string; roleName: string},
    RoleRepresentation,
    void
  >({
    method: 'PUT',
    path: '/{id}/roles/{roleName}',
    urlParamKeys: ['id', 'roleName'],
  });

  public delRole = this.makeRequest<{id: string; roleName: string}, void>({
    method: 'DELETE',
    path: '/{id}/roles/{roleName}',
    urlParamKeys: ['id', 'roleName'],
  });

  public findUsersWithRole = this.makeRequest<
    {id: string; roleName: string; first?: number; max?: number},
    UserRepresentation[]
  >({
    method: 'GET',
    path: '/{id}/roles/{roleName}/users',
    urlParamKeys: ['id', 'roleName'],
  });

  /**
   * Service account user
   */

  public getServiceAccountUser = this.makeRequest<
    {id: string},
    UserRepresentation
  >({
    method: 'GET',
    path: '/{id}/service-account-user',
    urlParamKeys: ['id'],
  });

  /**
   * Client secret
   */

  public generateNewClientSecret = this.makeRequest<{id: string}, {id: string}>(
    {
      method: 'POST',
      path: '/{id}/client-secret',
      urlParamKeys: ['id'],
    },
  );

  public getClientSecret = this.makeRequest<
    {id: string},
    CredentialRepresentation
  >({
    method: 'GET',
    path: '/{id}/client-secret',
    urlParamKeys: ['id'],
  });

  public getClientPermissions = this.makeRequest<{id: string}, PolicyRepresentation[]>({
    method: 'GET',
    path: '/{id}/authz/resource-server/permission',
    urlParamKeys: ['id'],
  });

  public getPermission = this.makeRequest<{id: string, permissionId: string}>({
    method: 'GET',
    path: '/{id}/authz/resource-server/permission/resource/{permissionId}',
    urlParamKeys: ['id', 'permissionId'],
  });

  public getPermissionResources = this.makeRequest<{id: string, permissionId: string}>({
    method: 'GET',
    path: '/{id}/authz/resource-server/permission/{permissionId}/resources',
    urlParamKeys: ['id', 'permissionId'],
  });

  public getPermissionPolicies = this.makeRequest<{id: string, permissionId: string}>({
    method: 'GET',
    path: '/{id}/authz/resource-server/policy/{permissionId}/associatedPolicies',
    urlParamKeys: ['id', 'permissionId'],
  });

  public updatePermission = this.makeUpdateRequest<
      {id: string, permissionId: string},
      ResourcePermissionRepresentation,
      void
      >({
    method: 'PUT',
    path: '/{id}/authz/resource-server/permission/{permissionId}',
    urlParamKeys: ['id', 'permissionId'],
  });

  public createPermission = this.makeRequest<ResourcePermissionRepresentation, {id: string}>({
    method: 'POST',
    path: '/{id}/authz/resource-server/permission/',
    urlParamKeys: ['id'],
  });

  public deletePermission = this.makeRequest<{id: string, permissionId: string}, void> ({
    method: 'DELETE',
    path: '/{id}/authz/resource-server/permission/{permissionId}',
    urlParamKeys: ['id', 'permissionId'],
  });

  public getClientResources = this.makeRequest<
      {id: string},
      ResourceRepresentation[]
  >({
    method: 'GET',
    path: '/{id}/authz/resource-server/resource',
    urlParamKeys: ['id'],
  });

  public createClientResource = this.makeRequest<ResourceRepresentation, {_id: string}>({
    method: 'POST',
    path: '/{id}/authz/resource-server/resource',
    urlParamKeys: ['id'],
  });

  public updateResource = this.makeUpdateRequest<
      {id: string, resourceId: string},
      ResourceRepresentation,
      void
      >({
    method: 'PUT',
    path: '/{id}/authz/resource-server/resource/{resourceId}',
    urlParamKeys: ['id', 'resourceId'],
  });

  public deleteResource = this.makeRequest<{id: string, resourceId: string}, void> ({
    method: 'DELETE',
    path: '/{id}/authz/resource-server/resource/{resourceId}',
    urlParamKeys: ['id', 'resourceId'],
  });

  public getPolicies = this.makeRequest<{id: string}, PolicyRepresentation[]>({
    method: 'GET',
    path: '/{id}/authz/resource-server/policy?permission=false',
    urlParamKeys: ['id'],
  });

  public deletePolicy = this.makeRequest<{id: string, policyId: string}>({
    method: 'DELETE',
    path: '/{id}/authz/resource-server/policy/{policyId}',
    urlParamKeys: ['id', 'policyId'],
  });

  public createPolicy = this.makeRequest<PolicyRepresentation, {id: string}>({
    method: 'POST',
    path: '/{id}/authz/resource-server/policy/{type}',
    urlParamKeys: ['id', 'type'],
  });

  public updatePolicy = this.makeUpdateRequest< {id: string, type: string ,policyId: string} , PolicyRepresentation, void>({
    method: 'PUT',
    path: '/{id}/authz/resource-server/policy/{type}/{policyId}',
    urlParamKeys: ['id', 'type', 'policyId'],
  });

  constructor(client: KeycloakAdminClient) {
    super(client, {
      path: '/admin/realms/{realm}/clients',
      getUrlParams: () => ({
        realm: client.realmName,
      }),
      getBaseUrl: () => client.baseUrl,
    });
  }
}
