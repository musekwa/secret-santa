import api, { apiRoutes } from ".";

export default class GroupApi {
  // find many
  static findMany = 
  async () => {
    const response = await api.get(apiRoutes.groups.findMany);
    if (response.data.success) {
      return response.data.data;
    }
    return { success: false, data: null, message: response.data.message };
  };

  // find by id
  static findById = async (id: string) => {
    const response = await api.get<{ success: boolean, data: any, message: string }>(`${apiRoutes.groups.findById.replace(":id", id)}`);
    if (response.data.success) {
      return response.data.data;
    }
    return { success: false, data: null, message: response.data.message };
  };

  // create
  static create = async (name: string, owner_id: string) => {
    const response = await api.post<{ success: boolean, data: any, message: string }>(apiRoutes.groups.create, {
      name,
      owner_id,
    });
    if (response.data.success) {
      return response.data.data;
    }
    return { success: false, data: null, message: response.data.message };
  };
}
