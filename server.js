const express = require('express')
const expressGraphQL = require('express-graphql')
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql')
const app = express()

const mutations = [
	{ id: 1, func: 'splicing', chromosome: 15, start: 67031799, end: 67031799, ref: "A", obs: "G", refGenome: "hg19", },
	{ id: 2, func: 'splicing', chromosome: 23, start: 27491799, end: 27491999, ref: "G", obs: "A", refGenome: "hg21", },
	{ id: 3, func: 'splicing', chromosome: 4, start: 83641999, end: 83642345, ref: "G", obs: "C", refGenome: "hh20", },
]

const genes = [
	{ id: 1, name: 'ABCA9', mutationId: 1 },
	{ id: 2, name: 'ABBB10', mutationId: 1 },
	{ id: 3, name: 'BCL2', mutationId: 1 },
	{ id: 4, name: 'ATR', mutationId: 2 },
	{ id: 5, name: 'B', mutationId: 2 },
	{ id: 6, name: 'BUB1B', mutationId: 2 },
	{ id: 7, name: 'CAT', mutationId: 3 },
	{ id: 8, name: 'CDC42', mutationId: 3 }
]

const GeneType = new GraphQLObjectType({
  name: 'Gene',
  description: 'This represents a gene with a mutation',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    mutationId: { type: GraphQLNonNull(GraphQLInt) },
    mutation: {
      type: MutationType,
      resolve: (gene) => {
        return mutations.find(mutation => mutation.id === gene.mutationId)
      }
    }
  })
})

const MutationType = new GraphQLObjectType({
  name: 'Mute',
  description: 'This represents a mutation of a gene',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    func: { type: GraphQLNonNull(GraphQLString) },
    chromosome: { type: GraphQLNonNull(GraphQLInt) },
    start: { type: GraphQLNonNull(GraphQLInt) },
    end: { type: GraphQLNonNull(GraphQLInt) },
    ref: { type: GraphQLNonNull(GraphQLString) },
    obs: { type: GraphQLNonNull(GraphQLString) },
    refGenome: { type: GraphQLNonNull(GraphQLString) },
    genes: {
      type: new GraphQLList(GeneType),
      resolve: (mutation) => {
        return genes.filter(gene => gene.mutationId === mutation.id)
      }
    }
  })
})

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    gene: {
      type: GeneType,
      description: 'A Single Gene',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => genes.find(gene => gene.id === args.id)
    },
    genes: {
      type: new GraphQLList(GeneType),
      description: 'List of All Genes',
      resolve: () => genes
    },
    mutations: {
      type: new GraphQLList(MutationType),
      description: 'List of All Mutations',
      resolve: () => mutations
    },
    mutation: {
      type: MutationType,
      description: 'A Single Mutation',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => mutations.find(mutation => mutation.id === args.id)
    }
  })
})

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addGene: {
      type: GeneType,
      description: 'Add a gene',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        mutationId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const gene = { id: genes.length + 1, name: args.name, mutationId: args.mutationId }
        genes.push(gene)
        return gene
      }
    },
    addMutation: {
      type: MutationType,
      description: 'Add a mutation',
      args: {
        func: { type: GraphQLNonNull(GraphQLString) },
        chromosome: { type: GraphQLNonNull(GraphQLInt) },
        start: { type: GraphQLNonNull(GraphQLInt) },
        end: { type: GraphQLNonNull(GraphQLInt) },
        ref: { type: GraphQLNonNull(GraphQLString) },
        obs: { type: GraphQLNonNull(GraphQLString) },
        refGenome: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const mutation = { id: mutations.length + 1, func: args.func, chromosome: args.chromosome, start: args.start, end: args.end, ref: args.ref, obs: args.obs, refGenome: args.refGenome }
        mutations.push(mutation)
        return mutation
      }
    }
  })
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
  schema: schema,
  graphiql: true
}))
app.listen(5051, () => console.log('Server Running'))