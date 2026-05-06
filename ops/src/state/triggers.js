import { ref } from "vue";
import { generateObjectID } from "es-object-id";

export const listenersHash = ref(generateObjectID())
export const targetSystemsHash = ref(generateObjectID())
export const triggersHash = ref(generateObjectID())
export const bindingsHash = ref(generateObjectID())
export const templatesHash = ref(generateObjectID())
export const sourceInterceptorsHash = ref(generateObjectID())
export const targetInterceptorsHash = ref(generateObjectID())
