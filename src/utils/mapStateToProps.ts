export default function mapStateToProps<T>(data: T, storeName = 'lightProps') {
  return { [storeName]: data }
}
