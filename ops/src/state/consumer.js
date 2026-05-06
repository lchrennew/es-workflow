import { ref } from 'vue';

export const consumer = ref(null)
export const checkin = username => {
    consumer.value = username
    console.log(`hello, ${username}! welcome to pippy-ops!`)
}
export const checkout = () => consumer.value = null
