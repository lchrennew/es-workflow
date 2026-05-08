import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGO_URL || 'mongodb://localhost')

async function createIndexes() {
  try {
    await client.connect()
    const db = client.db()
    
    console.log('Creating indexes for runs collection...')
    await db.collection('runs').createIndex({ workflowId: 1, createdAt: -1 })
    await db.collection('runs').createIndex({ status: 1, createdAt: -1 })
    await db.collection('runs').createIndex({ createdAt: -1 })
    console.log('✓ runs indexes created')
    
    console.log('Creating indexes for tasks collection...')
    await db.collection('tasks').createIndex({ runId: 1, createdAt: -1 })
    await db.collection('tasks').createIndex({ status: 1, createdAt: -1 })
    await db.collection('tasks').createIndex({ stateName: 1 })
    console.log('✓ tasks indexes created')
    
    console.log('Creating indexes for requests collection...')
    await db.collection('requests').createIndex({ target: 1, status: 1, createdAt: -1 })
    await db.collection('requests').createIndex({ target: 1, createdAt: -1 })
    await db.collection('requests').createIndex({ status: 1, createdAt: -1 })
    await db.collection('requests').createIndex({ runId: 1, createdAt: -1 })
    await db.collection('requests').createIndex({ taskId: 1, createdAt: -1 })
    await db.collection('requests').createIndex({ sentAt: -1 })
    await db.collection('requests').createIndex({ taskName: 1 })
    console.log('✓ requests indexes created')
    
    console.log('Creating indexes for events collection...')
    await db.collection('events').createIndex({ runId: 1, timestamp: -1 })
    await db.collection('events').createIndex({ taskId: 1, timestamp: -1 })
    await db.collection('events').createIndex({ requestId: 1, timestamp: -1 })
    await db.collection('events').createIndex({ eventType: 1, timestamp: -1 })
    await db.collection('events').createIndex({ timestamp: -1 })
    await db.collection('events').createIndex({ createdAt: -1 })
    console.log('✓ events indexes created')
    
    console.log('\n✅ All indexes created successfully!')
  } catch (error) {
    console.error('❌ Error creating indexes:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

createIndexes()
