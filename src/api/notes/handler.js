const ClientError = require("../../exceptions/ClientError");

class NotesHandler {
  constructor(services, validator) {
    this._services = services;
    this._validator = validator;
    this.postNoteHandler = this.postNoteHandler.bind(this);
    this.getNotesHandler = this.getNotesHandler.bind(this);
    this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
    this.putNoteByIdHandler = this.putNoteByIdHandler.bind(this);
    this.deleteNoteByIdHandler = this.deleteNoteByIdHandler.bind(this);
  }
  async postNoteHandler(request, h) {
    try {
      this._validator.validateNotePayload(request.payload);
      const { title = "untitled", body, tags } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      const noteId = await this._services.addNote({
        title,
        body,
        tags,
        owner: credentialId,
      });

      const response = h.response({
        status: "success",
        message: "Catatan berhasil ditambahkan",
        data: {
          noteId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      // Server ERROR!
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
  async getNotesHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const notes = await this._services.getNotes(credentialId);
    return {
      status: "success",
      data: {
        notes,
      },
    };
  }
  async getNoteByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._services.verifyNoteOwner(id, credentialId);
      const note = await this._services.getNoteById(id);
      return {
        status: "success",
        data: {
          note,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      // Server ERROR!
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
  async putNoteByIdHandler(request, h) {
    try {
      const { id } = request.params;
      this._validator.validateNotePayload(request.payload);
      const { id: credentialId } = request.auth.credentials;
      await this._services.verifyNoteOwner(id, credentialId);
      await this._services.editNoteById(id, request.payload);

      return {
        status: "success",
        message: "Catatan berhasil diperbarui",
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
  async deleteNoteByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      await this._services.verifyNoteOwner(id, credentialId);
      await this._services.deleteNoteById(id);
      return {
        status: "success",
        message: "Catatan berhasil dihapus",
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = NotesHandler;
