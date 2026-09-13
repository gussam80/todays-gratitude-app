import { IStorageService } from './adapter';
import { LocalStorageService } from './localStorage';
import { SupabaseStorageService } from './supabase';
import { FirebaseStorageService } from './firebase';
import { ClassConfig } from '../../types';

let currentService: IStorageService = new LocalStorageService();

export function getStorageService(config?: ClassConfig): IStorageService {
  if (config && config.useFirebase && config.firebaseConfig && config.firebaseConfig.apiKey && config.firebaseConfig.projectId) {
    if (!(currentService instanceof FirebaseStorageService)) {
      currentService = new FirebaseStorageService(config.firebaseConfig);
    }
  } else if (config && config.useSupabase && config.supabaseUrl && config.supabaseAnonKey) {
    if (!(currentService instanceof SupabaseStorageService)) {
      currentService = new SupabaseStorageService(config.supabaseUrl, config.supabaseAnonKey);
    }
  } else {
    if (!(currentService instanceof LocalStorageService)) {
      currentService = new LocalStorageService();
    }
  }
  return currentService;
}

export const storage = getStorageService();
