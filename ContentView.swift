import SwiftUI

// This view demonstrates the SOLVY Card brand's uniform color scheme and logo usage.
// To use your own logo, add a PNG named "Logo" to Assets.xcassets.

struct ContentView: View {
    var body: some View {
        ZStack {
            Color("BrandBackground", bundle: nil)
                .ignoresSafeArea()
            VStack(spacing: 32) {
                Image("Logo")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 120, height: 120)
                    .clipShape(RoundedRectangle(cornerRadius: 32))
                    .shadow(radius: 8)
                Text("SOLVY Card")
                    .font(.largeTitle.bold())
                    .foregroundColor(Color("BrandPrimary", bundle: nil))
            }
        }
    }
}

#Preview {
    ContentView()
}

// NOTE: To complete the branding, define colors 'BrandBackground' and 'BrandPrimary' in Assets.xcassets, or replace with Color.blue/Color.white as desired.
