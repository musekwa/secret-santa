import api, { apiRoutes } from ".";

export default class ParticipantApi {
  // find many
  static findMany = async (group_id?: string) => {
    const url = group_id
      ? `${apiRoutes.participants.findMany}?group_id=${group_id}`
      : apiRoutes.participants.findMany;
    const response = await api.get(url);
    if (response.data.success) {
      return response.data.data;
    }
    return { success: false, data: null, message: response.data.message };
  };

  // create participant
  static create = async ({group_id, email, name}: {group_id: string, email: string, name: string}) => {
    const response = await api.post<{
      success: boolean;
      data: any;
      message: string;
    }>(apiRoutes.participants.create, {
      group_id,
      email,
      name,
    });
    if (response.data.success) {
      return response.data.data;
    }
    return { success: false, data: null, message: response.data.message };
  };

  // find by id
  static findById = async (id: string) => {
    const response = await api.get<{
      success: boolean;
      data: any;
      message: string;
    }>(apiRoutes.participants.findById.replace(":id", id));
    if (response.data.success) {
      return response.data.data;
    }
    return { success: false, data: null, message: response.data.message };
  };
}
