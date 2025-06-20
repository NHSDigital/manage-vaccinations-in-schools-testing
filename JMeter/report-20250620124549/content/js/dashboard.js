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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4987603305785124, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.585, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.0, 500, 1500, "Vaccination"], "isController": true}, {"data": [0.4857142857142857, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.9130434782608695, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate Slug"], "isController": false}, {"data": [0.155, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8787878787878788, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.03535353535353535, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9857142857142858, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.135, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5285714285714286, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0390625, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.03, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.46774193548387094, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [1.0, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.7847826086956522, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.02142857142857143, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.745, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.5, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5142857142857142, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.851528384279476, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [1.0, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.15, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1938, 0, 0.0, 1771.045407636739, 0, 24537, 584.0, 4524.9000000000015, 9197.8, 17810.06999999997, 3.2276438200113917, 94.65375594826193, 3.7759414793867143], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 100, 0, 0.0, 22641.189999999995, 5677, 51426, 23413.5, 41011.0, 42350.1, 51394.54999999998, 0.24035977050449112, 87.83513099907942, 1.0328381396273942], "isController": true}, {"data": ["2.5 Select patient", 100, 0, 0.0, 1627.22, 311, 19689, 608.0, 3554.800000000001, 10085.499999999933, 19655.559999999983, 0.2513295332307909, 6.196919889810849, 0.17426168807994288], "isController": false}, {"data": ["Vaccination", 83, 0, 0.0, 32501.253012048182, 7956, 58895, 35596.0, 48999.4, 52401.59999999999, 58895.0, 0.19930076646752598, 112.2942642612605, 4.172592475255489], "isController": true}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 2568.342857142857, 367, 21567, 895.0, 7005.299999999999, 10458.550000000012, 21567.0, 0.8945572580542102, 12.85314544702304, 1.2929147870314757], "isController": false}, {"data": ["2.5 Select menacwy", 69, 0, 0.0, 402.50724637681157, 307, 797, 364.0, 607.0, 646.5, 797.0, 0.18786296349740939, 4.242032181231946, 0.13099038665737336], "isController": false}, {"data": ["Calculate Slug", 70, 0, 0.0, 4.471428571428574, 0, 210, 1.0, 3.0, 3.450000000000003, 210.0, 1.187165049860932, 2.7325498662319383, 0.0], "isController": false}, {"data": ["2.3 Search by first/last name", 100, 0, 0.0, 5526.399999999998, 990, 23584, 3026.5, 13022.100000000002, 18067.499999999993, 23567.459999999992, 0.2436427515063213, 27.308854837953206, 0.21018470100161535], "isController": false}, {"data": ["2.5 Select td_ipv", 66, 0, 0.0, 411.93939393939394, 311, 643, 360.0, 610.6, 625.75, 643.0, 0.28433078871637574, 6.512998406832124, 0.19797641831521084], "isController": false}, {"data": ["4.0 Vaccination for hpv", 99, 0, 0.0, 1967.5555555555559, 835, 3519, 1961.0, 2172.0, 2432.0, 3519.0, 0.2491788424510137, 12.169511615761191, 1.4160764596783328], "isController": true}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 120.11428571428571, 88, 1779, 93.0, 97.0, 132.45000000000016, 1779.0, 1.1587677332847754, 6.983159845801122, 0.6982028236686586], "isController": false}, {"data": ["2.4 Patient attending session", 100, 0, 0.0, 5290.929999999999, 1141, 24537, 2308.5, 14463.100000000011, 18385.6, 24535.88, 0.2423449295382117, 22.930260702557952, 0.3602040847237874], "isController": false}, {"data": ["5.4 Consent route", 1, 0, 0.0, 413.0, 413, 413, 413.0, 413.0, 413.0, 413.0, 2.4213075060532687, 27.528185532687655, 3.7667410714285716], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 277.15714285714284, 261, 586, 270.5, 282.8, 287.45, 586.0, 1.1870040018992065, 6.126285302770806, 0.643346895560605], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 2502.385714285714, 423, 15422, 597.0, 6747.9, 11752.150000000005, 15422.0, 0.9355662180403898, 9.078829598307962, 1.4718722434209648], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 64, 0, 0.0, 2327.5468749999995, 813, 6017, 2066.0, 3725.5, 4835.5, 6017.0, 0.31113271754982985, 16.566962657997085, 1.7874227105614975], "isController": true}, {"data": ["2.1 Open session", 100, 0, 0.0, 5761.42, 1438, 19903, 4217.5, 11924.400000000001, 17338.199999999957, 19897.829999999998, 0.2426536604304676, 4.086650200340928, 0.15116090819198758], "isController": false}, {"data": ["4.3 Vaccination confirm", 217, 0, 0.0, 1107.36866359447, 791, 3926, 1043.0, 1326.4000000000003, 1601.6999999999998, 3248.2599999999957, 0.5692863457850511, 11.555446022406796, 1.325397955258553], "isController": false}, {"data": ["5.6 Consent questions", 1, 0, 0.0, 419.0, 419, 419, 419.0, 419.0, 419.0, 419.0, 2.3866348448687353, 28.665255817422434, 4.628766408114559], "isController": false}, {"data": ["4.1 Vaccination questions", 230, 0, 0.0, 535.9782608695652, 398, 3627, 455.5, 613.9, 656.0, 2576.4099999999985, 0.5317869892532786, 6.167620433134722, 1.0431284486675267], "isController": false}, {"data": ["5.3 Consent parent details", 1, 0, 0.0, 404.0, 404, 404, 404.0, 404.0, 404.0, 404.0, 2.4752475247524752, 27.984316986386137, 4.471882735148514], "isController": false}, {"data": ["5.2 Consent who", 1, 0, 0.0, 436.0, 436, 436, 436.0, 436.0, 436.0, 436.0, 2.293577981651376, 44.47839019495413, 3.608353641055046], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 8074.985714285714, 1455, 42650, 4618.0, 19227.5, 23202.050000000003, 42650.0, 0.7021837915918506, 32.391656018968995, 3.3429160000100313], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 66, 0, 0.0, 2011.8181818181818, 1798, 3111, 1960.0, 2212.6000000000004, 2304.65, 3111.0, 0.28060150759537267, 14.591220268463367, 1.6634972779527994], "isController": true}, {"data": ["2.5 Select hpv", 100, 0, 0.0, 672.2699999999998, 305, 3936, 418.0, 1152.9000000000005, 1687.9499999999998, 3935.6499999999996, 0.25176804106840284, 5.153118930029885, 0.18759669466327283], "isController": false}, {"data": ["5.1 Consent start", 1, 0, 0.0, 514.0, 514, 514, 514.0, 514.0, 514.0, 514.0, 1.9455252918287937, 22.225346546692606, 4.136141172178988], "isController": false}, {"data": ["5.5 Consent agree", 1, 0, 0.0, 658.0, 658, 658, 658.0, 658.0, 658.0, 658.0, 1.5197568389057752, 23.953979863221882, 2.3360324848024314], "isController": false}, {"data": ["Debug Sampler", 100, 0, 0.0, 0.18999999999999997, 0, 1, 0.0, 1.0, 1.0, 1.0, 0.24473333855431123, 0.6628855811988508, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 70, 0, 0.0, 2606.9857142857136, 273, 17069, 806.0, 9351.999999999998, 13178.6, 17069.0, 0.7296759196522573, 7.931662755516871, 0.4360953738546694], "isController": false}, {"data": ["4.2 Vaccination batch", 229, 0, 0.0, 495.9301310043668, 391, 2551, 436.0, 605.0, 621.5, 1949.099999999987, 0.5450434368677852, 10.98227102671665, 0.8738787486611925], "isController": false}, {"data": ["5.7 Consent triage", 1, 0, 0.0, 431.0, 431, 431, 431.0, 431.0, 431.0, 431.0, 2.320185614849188, 37.077653712296986, 3.7453777552204177], "isController": false}, {"data": ["2.2 Session register", 100, 0, 0.0, 4435.030000000001, 689, 20751, 2226.0, 12089.800000000003, 17284.049999999985, 20745.209999999995, 0.2425541926704974, 27.77763065560579, 0.15323076878764139], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1938, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
