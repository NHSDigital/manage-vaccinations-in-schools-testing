/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 91.28006021948417, "KoPercent": 8.719939780515828};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3841046151923257, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Prevent multiple runs"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Completed sessions list"], "isController": false}, {"data": [0.4673913043478261, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [1.0, 500, 1500, "Scheduled sessions list"], "isController": false}, {"data": [0.24010477299185098, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.25, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.7848101265822784, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.005154639175257732, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [0.11861198738170348, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.64, 500, 1500, "6.1 Logout"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.6703910614525139, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.44039735099337746, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Get school name"], "isController": false}, {"data": [0.07091346153846154, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.8102064220183486, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.3116504854368932, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.4322916666666667, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.5, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.7597938144329897, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.37660944206008584, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent"], "isController": true}, {"data": [0.6890243902439024, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.6706093189964157, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.5, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7763157894736842, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.4512044471896232, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.19634340222575516, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent homepage"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 25241, 2201, 8.719939780515828, 1398.043777980267, 0, 51069, 821.0, 2224.0, 3352.850000000002, 7532.960000000006, 4.659915349455805, 169.37101366664731, 4.561419344934905], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Prevent multiple runs", 1, 0, 0.0, 21.0, 21, 21, 21.0, 21.0, 21.0, 21.0, 47.61904761904761, 0.0, 0.0], "isController": false}, {"data": ["2.0 Register attendance", 2912, 1570, 53.91483516483517, 7947.3863324175745, -1, 86179, 6470.0, 17825.300000000003, 26144.149999999998, 46091.36, 0.5720872126524003, 112.84446918092563, 1.4925013302083658], "isController": true}, {"data": ["Completed sessions list", 1, 0, 0.0, 328.0, 328, 328, 328.0, 328.0, 328.0, 328.0, 3.048780487804878, 46.24380716463414, 1.8518959603658536], "isController": false}, {"data": ["1.4 Select Organisations", 138, 44, 31.884057971014492, 868.1159420289852, 154, 16540, 484.0, 1262.5000000000005, 2037.4499999999894, 15842.289999999974, 0.027073666268801484, 0.3041961445309036, 0.03353458429121142], "isController": false}, {"data": ["Scheduled sessions list", 1, 0, 0.0, 434.0, 434, 434, 434.0, 434.0, 434.0, 434.0, 2.304147465437788, 26.65745607718894, 1.3995895737327189], "isController": false}, {"data": ["2.3 Search by first/last name", 1718, 115, 6.69383003492433, 2554.126891734571, 922, 41645, 1462.0, 4918.600000000002, 7798.849999999991, 16846.889999999996, 0.3380368597910468, 37.435733736501646, 0.29159414557740354], "isController": false}, {"data": ["5.8 Consent confirm", 2, 0, 0.0, 1392.5, 1194, 1591, 1392.5, 1591.0, 1591.0, 1591.0, 0.007402664218852365, 0.6200309616430953, 0.016084890514596203], "isController": false}, {"data": ["1.2 Sign-in page", 158, 7, 4.430379746835443, 603.3860759493671, 152, 8246, 192.5, 1323.599999999999, 2685.949999999995, 8231.84, 0.03096764684495538, 0.27541150373846135, 0.026828725295216734], "isController": false}, {"data": ["3.0 Nurse triage", 1940, 240, 12.371134020618557, 2605.672164948457, 320, 47199, 2087.0, 3975.3000000000006, 5719.999999999993, 13999.689999999993, 0.37172270865523754, 39.954671550293504, 1.0594235664580802], "isController": true}, {"data": ["2.4 Patient attending session", 1585, 190, 11.987381703470032, 2859.246687697165, 159, 51069, 1766.0, 5987.000000000002, 8859.899999999998, 17372.359999999946, 0.31187213596601954, 27.847620341200905, 0.4485609984758602], "isController": false}, {"data": ["6.1 Logout", 25, 0, 0.0, 654.48, 470, 3006, 506.0, 897.6000000000001, 2389.4999999999986, 3006.0, 0.013377003005545035, 0.08412567272948115, 0.028282433112309574], "isController": false}, {"data": ["5.4 Consent route", 3, 0, 0.0, 1524.0, 526, 3502, 544.0, 3502.0, 3502.0, 3502.0, 0.0024921373067970554, 0.028395925178976992, 0.003876928446999716], "isController": false}, {"data": ["1.1 Homepage", 179, 21, 11.731843575418994, 996.8268156424581, 152, 19194, 483.0, 1153.0, 3246.0, 15959.599999999955, 0.03507757729559717, 0.2869230464214502, 0.029977534550923723], "isController": false}, {"data": ["1.3 Sign-in", 151, 13, 8.609271523178808, 1149.5298013245038, 164, 15705, 643.0, 1698.000000000001, 4412.800000000009, 12062.91999999993, 0.02961905772558198, 0.3190126757430117, 0.04618246756762217], "isController": false}, {"data": ["Get school name", 1, 0, 0.0, 8458.0, 8458, 8458, 8458.0, 8458.0, 8458.0, 8458.0, 0.11823126034523528, 1175.15568655415, 0.07400999793095295], "isController": false}, {"data": ["2.1 Open session", 2912, 1025, 35.199175824175825, 2532.681318681322, 0, 40808, 1685.5, 5707.600000000002, 8643.899999999998, 17253.539999999994, 0.5725116925486384, 6.78091364231516, 0.3145336486644965], "isController": false}, {"data": ["3.3 Nurse triage complete", 1744, 44, 2.522935779816514, 630.3784403669727, 169, 33540, 431.0, 877.0, 1260.75, 4318.949999999987, 0.3345880384776244, 7.607359823211757, 0.2265617206055583], "isController": false}, {"data": ["4.3 Vaccination confirm", 1545, 91, 5.889967637540453, 1687.450485436895, 176, 24119, 1271.0, 2419.2000000000016, 4080.599999999995, 8528.459999999985, 0.3004025394027997, 7.19166789535599, 0.6858245722812257], "isController": false}, {"data": ["5.6 Consent questions", 3, 0, 0.0, 596.0, 545, 675, 568.0, 675.0, 675.0, 675.0, 0.002512882712037043, 0.030224940172450764, 0.004873618228618719], "isController": false}, {"data": ["4.1 Vaccination questions", 1728, 109, 6.30787037037037, 965.3778935185189, 157, 22612, 829.0, 1323.2000000000003, 2101.3999999999996, 4930.300000000001, 0.3326331610622086, 3.7205005304348755, 0.7007098438938908], "isController": false}, {"data": ["5.3 Consent parent details", 3, 0, 0.0, 587.6666666666666, 523, 650, 590.0, 650.0, 650.0, 650.0, 0.002495265234218071, 0.028253680308281702, 0.0041457792172685665], "isController": false}, {"data": ["3.1 Nurse triage new", 1940, 76, 3.917525773195876, 616.8329896907203, 307, 19449, 392.0, 732.8000000000002, 1222.3999999999942, 3837.579999999962, 0.37178917407418266, 4.0808503230445465, 0.2560864127634073], "isController": false}, {"data": ["3.2 Nurse triage result", 1864, 120, 6.437768240343348, 1480.1040772532197, 170, 23106, 1070.0, 2147.5, 3372.5, 9886.449999999866, 0.35756316101947705, 28.308647847103867, 0.577756994325795], "isController": false}, {"data": ["5.2 Consent who", 3, 0, 0.0, 2130.3333333333335, 552, 5180, 659.0, 5180.0, 5180.0, 5180.0, 0.0024817508586857974, 0.03716809684453651, 0.003863194207758946], "isController": false}, {"data": ["1.0 Login", 179, 88, 49.16201117318436, 3581.3407821229057, 157, 41243, 2137.0, 6227.0, 13810.0, 34576.599999999904, 0.03506619086351377, 3.332845005403916, 0.1480118250321473], "isController": true}, {"data": ["5.0 Consent", 3, 1, 33.333333333333336, 8984.666666666666, 6866, 12937, 7151.0, 12937.0, 12937.0, 12937.0, 0.002483959829401639, 0.4086946757459538, 0.034720454125815876], "isController": true}, {"data": ["5.9 Patient return to menacwy vaccination page", 656, 10, 1.524390243902439, 749.469512195122, 174, 11446, 597.0, 1036.8000000000004, 1437.449999999997, 2966.9299999999976, 0.12979699828612562, 3.6454319299948, 0.09052346686694185], "isController": false}, {"data": ["4.0 Vaccination", 1728, 274, 15.856481481481481, 3175.4693287037053, 157, 42957, 2647.5, 4939.1, 6852.749999999998, 11823.960000000003, 0.33081799343571333, 16.095585245364337, 1.8676778190986512], "isController": true}, {"data": ["2.5 Patient return to consent page", 1395, 70, 5.017921146953405, 918.0043010752684, 170, 22501, 497.0, 1252.4, 2675.0000000000027, 8833.119999999999, 0.2746316539853778, 5.7936541579207805, 0.19041843196251781], "isController": false}, {"data": ["5.5 Consent agree", 3, 0, 0.0, 1118.3333333333333, 1041, 1223, 1091.0, 1223.0, 1223.0, 1223.0, 0.0025018618021577723, 0.04348613697526576, 0.003845635231051107], "isController": false}, {"data": ["Debug Sampler", 3057, 0, 0.0, 0.2587504088976126, 0, 13, 0.0, 1.0, 1.0, 1.0, 0.575383306543597, 2.1988182420694224, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 912, 22, 2.412280701754386, 548.53947368421, 304, 14733, 390.5, 710.7, 915.0, 2491.76, 0.17020358551022538, 1.8189764610494135, 0.10983712571307744], "isController": false}, {"data": ["4.2 Vaccination batch", 1619, 74, 4.570722668313774, 748.4978381717099, 167, 6523, 564.0, 1015.0, 1742.0, 3930.599999999994, 0.3133059427693188, 5.371833522400601, 0.5008770350009569], "isController": false}, {"data": ["5.7 Consent triage", 3, 1, 33.333333333333336, 866.6666666666666, 709, 1004, 887.0, 1004.0, 1004.0, 1004.0, 0.00251525713054436, 0.03191314361237876, 0.004149519250520449], "isController": false}, {"data": ["2.2 Session register", 1887, 169, 8.95601483836778, 2945.8600953895047, 389, 40944, 1560.0, 6552.6, 10758.79999999998, 19107.15999999993, 0.37137788477169603, 33.979097222946585, 0.2473150290400974], "isController": false}, {"data": ["5.1 Consent homepage", 3, 0, 0.0, 893.3333333333334, 787, 1082, 811.0, 1082.0, 1082.0, 1082.0, 0.0024871146733962462, 0.03131562355695534, 0.005297262795583215], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 59.0, 59, 59, 59.0, 59.0, 59.0, 59.0, 16.949152542372882, 0.11586334745762712, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://qa.mavistesting.com/sessions/${SessionId}", 451, 20.49068605179464, 1.7867754843310486], "isController": false}, {"data": ["502/Bad Gateway", 11, 0.49977283053157656, 0.0435798898617329], "isController": false}, {"data": ["500/Internal Server Error", 1321, 60.01817355747387, 5.233548591577196], "isController": false}, {"data": ["422/Unprocessable Entity", 75, 3.4075420263516585, 0.29713561269363337], "isController": false}, {"data": ["404/Not Found", 343, 15.58382553384825, 1.3589002020522167], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 25241, 2201, "500/Internal Server Error", 1321, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://qa.mavistesting.com/sessions/${SessionId}", 451, "404/Not Found", 343, "422/Unprocessable Entity", 75, "502/Bad Gateway", 11], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Select Organisations", 138, 44, "422/Unprocessable Entity", 43, "500/Internal Server Error", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.3 Search by first/last name", 1718, 115, "500/Internal Server Error", 112, "502/Bad Gateway", 3, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.2 Sign-in page", 158, 7, "500/Internal Server Error", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1585, 190, "500/Internal Server Error", 186, "422/Unprocessable Entity", 4, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.1 Homepage", 179, 21, "500/Internal Server Error", 21, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.3 Sign-in", 151, 13, "500/Internal Server Error", 13, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 2912, 1025, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://qa.mavistesting.com/sessions/${SessionId}", 451, "404/Not Found", 343, "500/Internal Server Error", 226, "502/Bad Gateway", 5, "", ""], "isController": false}, {"data": ["3.3 Nurse triage complete", 1744, 44, "500/Internal Server Error", 43, "502/Bad Gateway", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["4.3 Vaccination confirm", 1545, 91, "500/Internal Server Error", 91, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 1728, 109, "500/Internal Server Error", 81, "422/Unprocessable Entity", 28, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["3.1 Nurse triage new", 1940, 76, "500/Internal Server Error", 76, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["3.2 Nurse triage result", 1864, 120, "500/Internal Server Error", 120, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["5.9 Patient return to menacwy vaccination page", 656, 10, "500/Internal Server Error", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.5 Patient return to consent page", 1395, 70, "500/Internal Server Error", 70, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.5 Open Sessions list", 912, 22, "500/Internal Server Error", 22, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.2 Vaccination batch", 1619, 74, "500/Internal Server Error", 74, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["5.7 Consent triage", 3, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.2 Session register", 1887, 169, "500/Internal Server Error", 167, "502/Bad Gateway", 2, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
