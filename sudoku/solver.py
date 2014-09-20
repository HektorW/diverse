# Sudoku solver
# following: http://norvig.com/sudoku.html
# 

# . . . | . . . | . . .
# . . . | . . . | . . .
# . . . | . . . | . . .
# ---------------------
# . . . | . . . | . . .
# . . . | . . . | . . .
# . . . | . . . | . . .
# ---------------------
# . . . | . . . | . . .
# . . . | . . . | . . .
# . . . | . . . | . . .
# 

# rows: A - I
# cols: 1 - 9
# 
# square: on square containg a number or blank
# unit: collection of 9 squares (row, col or box)
# peers: squares that share a unit

# A puzzle
# 81 squares
# 27 units
# all squares should belong to 3 units
# all squares should have 20 peers 
#   a square belong to 3 units which gives 3 * 8 (excluding itself) => 24
#   removing the peers which appears twice (both box and row/col): 24 - 4 => 20





def cross(A, B):
  "Cross product of elements in A and B"
  return [a+b for a in A for b in B]



rows = "ABCDEFGHI"
cols = "123456789"

squares = cross(rows, cols)
unitlist = ([cross(rows, c) for c in cols] +
            [cross(r, cols) for r in rows] +
            [cross(rs, cs) for rs in ("ABC", "DEF", "GHI") for cs in ("123", "456", "789")])

units = dict((s, [u for u in unitlist if s in u]) for s in squares)
peers = dict((s, set(sum(units[s], [])) - set([s])) for s in squares)


def test():
  "Test definitions"
  assert(len(squares) == 81)
  assert(len(unitlist) == 27)
  assert(len(unit[s] == 3) for s in squares)
  assert(len(peers[s] == 20) for s in squares)
  assert units['C2'] == [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2'],
                         ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'],
                         ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3']]
  assert peers['C2'] == set(['A2', 'B2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2',
                             'C1', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9',
                             'A1', 'A3', 'B1', 'B3'])
  print("All tests pass")



test()
