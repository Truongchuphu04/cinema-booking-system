import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { theaterAPI } from '../services/apiServices';

// Initial state
const initialState = {
  theaters: [],
  theater: null,
  loading: false,
  error: null,
  stats: {
    totalTheaters: 0,
    activeTheaters: 0,
    inactiveTheaters: 0,
    maintenanceTheaters: 0,
    totalCapacity: 0,
    averageCapacity: 0,
    totalRooms: 0
  }
};

// Action types
const THEATER_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_THEATERS: 'SET_THEATERS',
  SET_THEATER: 'SET_THEATER',
  ADD_THEATER: 'ADD_THEATER',
  UPDATE_THEATER: 'UPDATE_THEATER',
  DELETE_THEATER: 'DELETE_THEATER',
  SET_STATS: 'SET_STATS',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const theaterReducer = (state, action) => {
  switch (action.type) {
    case THEATER_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case THEATER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case THEATER_ACTIONS.SET_THEATERS:
      console.log('Setting theaters in reducer:', action.payload);
      return {
        ...state,
        theaters: action.payload,
        loading: false,
        error: null
      };

    case THEATER_ACTIONS.SET_THEATER:
      return {
        ...state,
        theater: action.payload,
        loading: false,
        error: null
      };

    case THEATER_ACTIONS.ADD_THEATER:
      console.log('Adding theater to reducer:', action.payload);
      console.log('Current theaters:', state.theaters);
      const newTheaters = [...(state.theaters || []), action.payload];
      console.log('New theaters array:', newTheaters);
      return {
        ...state,
        theaters: newTheaters,
        loading: false,
        error: null
      };

    case THEATER_ACTIONS.UPDATE_THEATER:
      return {
        ...state,
        theaters: (state.theaters || []).map(theater =>
          theater._id === action.payload._id ? action.payload : theater
        ),
        theater: state.theater?._id === action.payload._id ? action.payload : state.theater,
        loading: false,
        error: null
      };

    case THEATER_ACTIONS.DELETE_THEATER:
      return {
        ...state,
        theaters: (state.theaters || []).filter(theater => theater._id !== action.payload),
        theater: state.theater?._id === action.payload ? null : state.theater,
        loading: false,
        error: null
      };

    case THEATER_ACTIONS.SET_STATS:
      return {
        ...state,
        stats: action.payload,
        loading: false,
        error: null
      };

    case THEATER_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const TheaterContext = createContext();

// Theater provider component
export const TheaterProvider = ({ children }) => {
  const [state, dispatch] = useReducer(theaterReducer, initialState);

  // Clear error
  const clearError = () => {
    dispatch({ type: THEATER_ACTIONS.CLEAR_ERROR });
  };

  // Get all theaters
  const getTheaters = async (filters = {}) => {
    try {
      dispatch({ type: THEATER_ACTIONS.SET_LOADING, payload: true });
      
      let response;
      if (Object.keys(filters).length > 0) {
        response = await theaterAPI.getByFilter(filters);
      } else {
        response = await theaterAPI.getAll();
      }
      
      console.log('Theater response:', response);
      console.log('Theater data:', response.data);
      
      // API client trả về JSON trực tiếp: { success, count, data }
      // Vậy response.data chính là array theaters chúng ta cần
      dispatch({ type: THEATER_ACTIONS.SET_THEATERS, payload: response.data });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi tải danh sách rạp';
      dispatch({ type: THEATER_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error('Theater error:', errorMessage);
    }
  };

  // Get theater by ID
  const getTheaterById = async (id) => {
    try {
      dispatch({ type: THEATER_ACTIONS.SET_LOADING, payload: true });
      const response = await theaterAPI.getById(id);
      dispatch({ type: THEATER_ACTIONS.SET_THEATER, payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi tải thông tin rạp';
      dispatch({ type: THEATER_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error('Theater error:', errorMessage);
      throw error;
    }
  };

  // Create new theater
  const createTheater = async (theaterData) => {
    try {
      dispatch({ type: THEATER_ACTIONS.SET_LOADING, payload: true });
      console.log('Creating theater with data:', theaterData);
      const response = await theaterAPI.create(theaterData);
      console.log('Create theater response:', response);
      
      // API client trả về JSON trực tiếp: { success, message, data }
      // Vậy response.data chính là theater object chúng ta cần
      dispatch({ type: THEATER_ACTIONS.ADD_THEATER, payload: response.data });
      console.log('Theater created successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi tạo rạp';
      dispatch({ type: THEATER_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error('Theater error:', errorMessage);
      throw error;
    }
  };

  // Update theater
  const updateTheater = async (id, theaterData) => {
    try {
      dispatch({ type: THEATER_ACTIONS.SET_LOADING, payload: true });
      const response = await theaterAPI.update(id, theaterData);
      dispatch({ type: THEATER_ACTIONS.UPDATE_THEATER, payload: response.data });
      console.log('Theater updated successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật rạp';
      dispatch({ type: THEATER_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error('Theater error:', errorMessage);
      throw error;
    }
  };

  // Delete theater
  const deleteTheater = async (id) => {
    try {
      dispatch({ type: THEATER_ACTIONS.SET_LOADING, payload: true });
      await theaterAPI.delete(id);
      dispatch({ type: THEATER_ACTIONS.DELETE_THEATER, payload: id });
      console.log('Theater deleted successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi xóa rạp';
      dispatch({ type: THEATER_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error('Theater error:', errorMessage);
      throw error;
    }
  };

  // Search theaters
  const searchTheaters = async (query) => {
    try {
      dispatch({ type: THEATER_ACTIONS.SET_LOADING, payload: true });
      const response = await theaterAPI.search(query);
      dispatch({ type: THEATER_ACTIONS.SET_THEATERS, payload: response.data.data });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi tìm kiếm rạp';
      dispatch({ type: THEATER_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error('Theater error:', errorMessage);
    }
  };

  // Get theaters by status
  const getTheatersByStatus = async (status) => {
    try {
      dispatch({ type: THEATER_ACTIONS.SET_LOADING, payload: true });
      const response = await theaterAPI.getByStatus(status);
      dispatch({ type: THEATER_ACTIONS.SET_THEATERS, payload: response.data.data });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi tải danh sách rạp theo trạng thái';
      dispatch({ type: THEATER_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error('Theater error:', errorMessage);
    }
  };

  // Get theaters by location
  const getTheatersByLocation = async (location) => {
    try {
      dispatch({ type: THEATER_ACTIONS.SET_LOADING, payload: true });
      const response = await theaterAPI.getByLocation(location);
      dispatch({ type: THEATER_ACTIONS.SET_THEATERS, payload: response.data.data });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi tải danh sách rạp theo địa điểm';
      dispatch({ type: THEATER_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error('Theater error:', errorMessage);
    }
  };

  // Update theater status
  const updateTheaterStatus = async (id, status) => {
    try {
      dispatch({ type: THEATER_ACTIONS.SET_LOADING, payload: true });
      const response = await theaterAPI.updateStatus(id, status);
      dispatch({ type: THEATER_ACTIONS.UPDATE_THEATER, payload: response.data.data });
      console.log('Theater status updated successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật trạng thái rạp';
      dispatch({ type: THEATER_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error('Theater error:', errorMessage);
      throw error;
    }
  };

  // Get active theaters only (helper function)
  const getActiveTheaters = () => {
    return (state.theaters || []).filter(theater => theater.status === 'active');
  };

  // Get theater by ID (from state)
  const getTheater = (id) => {
    return (state.theaters || []).find(theater => theater._id === id);
  };

  // Load theaters on mount (removed automatic loading to prevent CORS errors)
  // Call getTheaters() manually when needed

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    getTheaters,
    getTheaterById,
    createTheater,
    updateTheater,
    deleteTheater,
    searchTheaters,
    getTheatersByStatus,
    getTheatersByLocation,
    updateTheaterStatus,
    clearError,
    
    // Helper functions
    getActiveTheaters,
    getTheater
  };

  return (
    <TheaterContext.Provider value={value}>
      {children}
    </TheaterContext.Provider>
  );
};

// Custom hook to use theater context
export const useTheater = () => {
  const context = useContext(TheaterContext);
  if (!context) {
    throw new Error('useTheater must be used within a TheaterProvider');
  }
  return context;
};

// Export useTheaters for backward compatibility
export const useTheaters = () => {
  const context = useContext(TheaterContext);
  if (!context) {
    throw new Error('useTheaters must be used within a TheaterProvider');
  }
  return context;
};

export default TheaterContext;