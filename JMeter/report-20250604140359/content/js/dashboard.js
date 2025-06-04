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

    var data = {"OkPercent": 93.35085669781931, "KoPercent": 6.649143302180685};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5035593080043043, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9928571428571429, 500, 1500, "1.4 Select Organisations-0"], "isController": false}, {"data": [0.95, 500, 1500, "1.4 Select Organisations-1"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.95, 500, 1500, "1.3 Sign-in-1"], "isController": false}, {"data": [0.8285714285714286, 500, 1500, "1.3 Sign-in-0"], "isController": false}, {"data": [0.9285714285714286, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.5174563591022444, 500, 1500, "2.4 Patient attending session-1"], "isController": false}, {"data": [0.6433915211970075, 500, 1500, "2.4 Patient attending session-0"], "isController": false}, {"data": [0.4168466522678186, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.9071428571428571, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.10554089709762533, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch-2"], "isController": false}, {"data": [0.26346604215456676, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.90625, 500, 1500, "4.2 Vaccination batch-0"], "isController": false}, {"data": [0.886039886039886, 500, 1500, "4.2 Vaccination batch-1"], "isController": false}, {"data": [0.9428571428571428, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.42142857142857143, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [5.0E-4, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.8107734806629834, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.27350427350427353, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5708333333333333, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.8073878627968337, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.344, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.6060606060606061, 500, 1500, "3.2 Nurse triage result-1"], "isController": false}, {"data": [0.6749311294765841, 500, 1500, "3.2 Nurse triage result-0"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.6397435897435897, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.751219512195122, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.7443181818181818, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.6166180758017493, 500, 1500, "4.3 Vaccination confirm-0"], "isController": false}, {"data": [0.8440233236151603, 500, 1500, "4.3 Vaccination confirm-1"], "isController": false}, {"data": [0.7426900584795322, 500, 1500, "4.3 Vaccination confirm-2"], "isController": false}, {"data": [0.26857142857142857, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.7909604519774012, 500, 1500, "4.1 Vaccination questions-0"], "isController": false}, {"data": [0.8926553672316384, 500, 1500, "4.1 Vaccination questions-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10272, 683, 6.649143302180685, 6344.019470404988, 0, 88719, 556.0, 19728.200000000004, 48829.85000000007, 60446.0, 4.070635351201278, 91.66630270919468, 3.7777059587630215], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.4 Select Organisations-0", 70, 0, 0.0, 186.95714285714283, 154, 1385, 164.5, 179.0, 203.4500000000001, 1385.0, 0.0753868421959541, 0.05469963256991591, 0.06022112980106489], "isController": false}, {"data": ["1.4 Select Organisations-1", 70, 0, 0.0, 371.90000000000003, 169, 7500, 183.0, 241.89999999999995, 1622.6500000000049, 7500.0, 0.07538732932847121, 1.0283302891211776, 0.04873673048383588], "isController": false}, {"data": ["2.0 Register attendance", 1000, 618, 61.8, 48069.54099999997, 3422, 135658, 58955.5, 74884.0, 88745.0, 109723.6, 0.43891258529168814, 41.29779307139725, 1.0053905700673467], "isController": true}, {"data": ["1.3 Sign-in-1", 70, 0, 0.0, 509.2285714285714, 159, 12073, 170.0, 208.2, 1973.700000000009, 12073.0, 0.07537328619990502, 0.6779179354503176, 0.04975814596790605], "isController": false}, {"data": ["1.3 Sign-in-0", 70, 0, 0.0, 1579.4142857142856, 369, 27968, 416.5, 1504.8, 10637.15000000002, 27968.0, 0.07538830361239211, 0.05352275070918854, 0.06883599988045569], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 558.9714285714286, 323, 7664, 352.5, 421.79999999999995, 2135.300000000003, 7664.0, 0.07537231230409928, 1.082814537407817, 0.1089365451270185], "isController": false}, {"data": ["2.4 Patient attending session-1", 401, 11, 2.743142144638404, 4257.625935162094, 365, 60447, 742.0, 12508.200000000003, 20754.89999999999, 60334.36000000009, 0.1762838829932212, 9.26506298522029, 0.11775212496812823], "isController": false}, {"data": ["2.4 Patient attending session-0", 401, 0, 0.0, 3605.4314214463843, 206, 28618, 368.0, 14027.000000000002, 19148.799999999996, 27744.16000000001, 0.17630705742641817, 0.1310362325017444, 0.14428253332357271], "isController": false}, {"data": ["2.3 Search by first/last name", 463, 34, 7.34341252699784, 8223.704103671702, 367, 60447, 1018.0, 25100.20000000001, 51653.19999999987, 60439.36, 0.20365022128817784, 11.511610193133425, 0.17564462181428156], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 378.78571428571416, 148, 3513, 161.0, 586.0999999999997, 2533.3000000000006, 3513.0, 0.07872528026199774, 0.4744274457976445, 0.04743505656411387], "isController": false}, {"data": ["3.0 Nurse triage", 379, 20, 5.277044854881266, 8719.187335092347, 873, 89348, 1974.0, 26963.0, 40412.0, 69687.59999999995, 0.16780016638338396, 18.081420001436705, 0.4911459020509696], "isController": true}, {"data": ["4.2 Vaccination batch-2", 351, 0, 0.0, 0.34472934472934486, 0, 5, 0.0, 1.0, 1.0, 1.0, 0.15553870675990716, 0.7653901790655979, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 427, 37, 8.665105386416862, 10308.007025761117, 577, 88719, 1379.0, 32238.8, 51158.59999999997, 67511.4799999997, 0.1876825729478647, 9.40215011993334, 0.27132435411042416], "isController": false}, {"data": ["4.2 Vaccination batch-0", 352, 0, 0.0, 727.596590909091, 1, 23432, 179.0, 542.9999999999994, 4858.749999999998, 8970.659999999969, 0.15594521183960858, 0.1184947906214018, 0.13970899493753997], "isController": false}, {"data": ["4.2 Vaccination batch-1", 351, 0, 0.0, 791.8888888888893, 178, 15876, 203.0, 1174.0000000000014, 5615.999999999983, 11483.480000000032, 0.15552395844364383, 2.1157132728621324, 0.11048127354182996], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 784.2857142857141, 441, 15894, 471.0, 494.0, 1680.7000000000064, 15894.0, 0.07868209734998696, 0.406088754389337, 0.04264508205980739], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 2088.8142857142857, 529, 28543, 588.5, 4595.9, 14787.000000000002, 28543.0, 0.0753416474635158, 0.7311229988720279, 0.11853065826535543], "isController": false}, {"data": ["2.1 Open session", 1000, 475, 47.5, 32037.024999999983, 1500, 60505, 26428.5, 60445.0, 60449.0, 60459.99, 0.4397519974635105, 4.129988000404792, 0.2881685391581564], "isController": false}, {"data": ["3.3 Nurse triage complete", 362, 3, 0.8287292817679558, 1713.552486187845, 204, 60144, 287.5, 2916.599999999997, 9787.149999999994, 29596.150000000052, 0.1600277970935946, 3.68497926172922, 0.10814378475465573], "isController": false}, {"data": ["4.3 Vaccination confirm", 351, 13, 3.7037037037037037, 7666.176638176634, 590, 85448, 1284.0, 21911.800000000003, 37480.79999999992, 60911.720000000016, 0.1548464285178594, 3.6249291114373716, 0.3550532826395095], "isController": false}, {"data": ["4.1 Vaccination questions", 360, 8, 2.2222222222222223, 3204.169444444443, 350, 60449, 673.0, 8911.900000000003, 16538.199999999986, 60434.56, 0.15535214014834403, 1.7718239448407125, 0.3140402382540836], "isController": false}, {"data": ["3.1 Nurse triage new", 379, 4, 1.0554089709762533, 2186.050131926122, 173, 60159, 210.0, 7064.0, 12198.0, 41191.99999999973, 0.16772108205322467, 1.8699658609877663, 0.11530824391159195], "isController": false}, {"data": ["3.2 Nurse triage result", 375, 13, 3.466666666666667, 4948.69066666667, 478, 60457, 1174.0, 14377.400000000016, 26130.999999999996, 60433.88, 0.16586645317811183, 12.507663548469495, 0.2672112880138266], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 4292.257142857143, 1638, 45344, 1820.0, 9330.6, 18495.55, 45344.0, 0.07615657356344223, 3.5168867682305236, 0.36256181261892667], "isController": true}, {"data": ["3.2 Nurse triage result-1", 363, 1, 0.27548209366391185, 1387.7741046831964, 251, 45449, 585.0, 1610.2000000000003, 5922.8, 16077.560000000041, 0.16060141913253997, 12.38837408110438, 0.11304514545157314], "isController": false}, {"data": ["3.2 Nurse triage result-0", 363, 0, 0.0, 1960.330578512396, 218, 29151, 448.0, 7173.600000000003, 14166.600000000006, 21911.40000000006, 0.16059161419789134, 0.11903571717317174, 0.14928964754785898], "isController": false}, {"data": ["4.0 Vaccination", 360, 22, 6.111111111111111, 12268.641666666677, 492, 103153, 3408.0, 36546.5, 60340.899999999994, 84734.91999999995, 0.1548811437800378, 8.2143015332319, 0.9026754890748563], "isController": true}, {"data": ["2.5 Patient return to consent page", 390, 10, 2.5641025641025643, 4319.2, 201, 60453, 405.5, 14828.400000000003, 22892.849999999995, 55945.439999999886, 0.17138043424286542, 3.78610774957056, 0.11882823077386176], "isController": false}, {"data": ["1.5 Open Sessions list", 410, 4, 0.975609756097561, 2279.724390243904, 170, 60435, 215.0, 7061.9000000000015, 10503.949999999995, 32095.56999999994, 0.16519701758945318, 1.787733211727175, 0.10582146987068296], "isController": false}, {"data": ["4.2 Vaccination batch", 352, 1, 0.2840909090909091, 1626.0596590909088, 342, 38089, 390.0, 4540.399999999998, 8243.599999999995, 17617.29999999996, 0.15593263887196912, 2.9991742727204262, 0.25055263058804766], "isController": false}, {"data": ["4.3 Vaccination confirm-0", 343, 0, 0.0, 2920.0583090379014, 226, 29151, 528.0, 10090.400000000009, 16926.2, 25783.2, 0.1513555589190124, 0.11411264204476507, 0.14513296453470081], "isController": false}, {"data": ["4.3 Vaccination confirm-1", 343, 1, 0.2915451895043732, 1420.7230320699707, 160, 60440, 185.0, 2851.6, 7685.4000000000015, 23719.32, 0.15136270564146012, 0.1130479865009179, 0.10214026327954], "isController": false}, {"data": ["4.3 Vaccination confirm-2", 342, 4, 1.1695906432748537, 2181.3216374269005, 204, 60143, 398.5, 5312.4, 9848.89999999997, 37269.13999999998, 0.15090842903001622, 3.3961821125801146, 0.10448640252175927], "isController": false}, {"data": ["2.2 Session register", 525, 62, 11.80952380952381, 11692.365714285721, 366, 60453, 1549.0, 37009.60000000002, 60147.0, 60437.7, 0.2311723343518126, 12.548982476394002, 0.15279777487271212], "isController": false}, {"data": ["4.1 Vaccination questions-0", 354, 0, 0.0, 1253.1016949152543, 175, 22203, 480.0, 3004.5, 7971.25, 14756.149999999969, 0.15690752118916398, 0.11706815374033842, 0.20790714038923702], "isController": false}, {"data": ["4.1 Vaccination questions-1", 354, 2, 0.5649717514124294, 1151.081920903955, 170, 48270, 193.0, 1120.0, 8029.5, 22915.799999999996, 0.1569123896959091, 1.699390320982245, 0.11115190329963706], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 240, 35.13909224011713, 2.336448598130841], "isController": false}, {"data": ["504/Gateway Time-out", 442, 64.71449487554905, 4.302959501557632], "isController": false}, {"data": ["422/Unprocessable Entity", 1, 0.14641288433382138, 0.009735202492211837], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10272, 683, "504/Gateway Time-out", 442, "502/Bad Gateway", 240, "422/Unprocessable Entity", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session-1", 401, 11, "502/Bad Gateway", 7, "504/Gateway Time-out", 4, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.3 Search by first/last name", 463, 34, "504/Gateway Time-out", 21, "502/Bad Gateway", 13, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 427, 37, "502/Bad Gateway", 25, "504/Gateway Time-out", 12, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 1000, 475, "504/Gateway Time-out", 336, "502/Bad Gateway", 139, "", "", "", "", "", ""], "isController": false}, {"data": ["3.3 Nurse triage complete", 362, 3, "502/Bad Gateway", 2, "504/Gateway Time-out", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["4.3 Vaccination confirm", 351, 13, "504/Gateway Time-out", 8, "502/Bad Gateway", 5, "", "", "", "", "", ""], "isController": false}, {"data": ["4.1 Vaccination questions", 360, 8, "504/Gateway Time-out", 5, "502/Bad Gateway", 2, "422/Unprocessable Entity", 1, "", "", "", ""], "isController": false}, {"data": ["3.1 Nurse triage new", 379, 4, "504/Gateway Time-out", 3, "502/Bad Gateway", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["3.2 Nurse triage result", 375, 13, "504/Gateway Time-out", 8, "502/Bad Gateway", 5, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["3.2 Nurse triage result-1", 363, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.5 Patient return to consent page", 390, 10, "502/Bad Gateway", 7, "504/Gateway Time-out", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["1.5 Open Sessions list", 410, 4, "502/Bad Gateway", 3, "504/Gateway Time-out", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["4.2 Vaccination batch", 352, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm-1", 343, 1, "504/Gateway Time-out", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.3 Vaccination confirm-2", 342, 4, "502/Bad Gateway", 3, "504/Gateway Time-out", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["2.2 Session register", 525, 62, "504/Gateway Time-out", 38, "502/Bad Gateway", 24, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions-1", 354, 2, "502/Bad Gateway", 2, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
